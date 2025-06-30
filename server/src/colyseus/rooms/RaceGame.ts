import { Room, Client } from "colyseus";
import { ArraySchema, MapSchema } from "@colyseus/schema";
import { GameState, Player, Round, PlayedCard, Moves } from "../schemas/GameState";
import { createDeck, shuffleDeck,calculateRoundPoints, distributeCards, calculateMoveWinner, getCardRank, getCardSuit, getCardValue, getCardPoints } from "../utils/roomUtils";
import { IBids } from "../../types/game";

export class RaceGameRoom extends Room<GameState> {
  deck = shuffleDeck(createDeck());
  maxClients: number = 4;
  usernameToSessionMap = new Map<string, string>();

  override onCreate(options: { roomId: string; maxPlayers: number; maxPoints: number; creator: string }) {
    this.state = new GameState();
    this.state.deck = new ArraySchema(...this.deck);
    this.state.roomId = options?.roomId || this.roomId;
    this.state.maxPlayers = Number(options.maxPlayers);
    this.maxClients = Number(options.maxPlayers)+1
    this.state.maxPoints = Number(options.maxPoints);
    this.state.creator = options.creator;
    this.setMetadata(options)

    this.onMessage("play_card", this.handlePlayCard.bind(this));
    this.onMessage("leave_room", this._onLeave);
  }

  override onJoin(client: Client, options: { playerUsername: string }) {
    const existingSessionId = this.usernameToSessionMap.get(options.playerUsername);
  
    if (existingSessionId) {
      const player = this.state.players.get(existingSessionId);
      if (player) {
        this.state.players.delete(existingSessionId);
        player.id = client.sessionId;
        player.active = true;
        this.state.players.set(client.sessionId, player);
        this.usernameToSessionMap.set(options.playerUsername, client.sessionId);
        console.log(`Reconnected player: ${player.username}`);
        this.broadcastGameState();
        return;
      }
    }
  
    // New player join
    const player = new Player();
    player.id = client.sessionId;
    player.username = options.playerUsername;
    player.active = true;
  
    if (!this.state.playerUsernames.includes(options.playerUsername)) {
      this.state.playerUsernames.push(options.playerUsername);
    }
  
    this.state.players.set(client.sessionId, player);
    this.usernameToSessionMap.set(options.playerUsername, client.sessionId);
    console.log(`New player joined: ${player.username}`);
  
    if (this.state.players.size >= this.state.maxPlayers) {
      this.state.gameStatus = "ready";
      this.startGame()
    }
  
    this.broadcastGameState();
  }

  private broadcastGameState() {
    this.broadcast("update_state", { roomInfo: this.state });
  }


  startGame() {
    this.state.gameStatus = "started";

    //
    // Start a the first round of the game
    //
    this.state.nextPlayerIndex = 0;
    this.state.roundStatus = "in_progress";
    this.startRound();
  }

  startRound() {
    const round = new Round();
    round.roundNumber = 0;
    this.state.rounds.push(round);
    this.state.moveNumber = 0

    const deck = this.deck;
    const playersArray = Array.from(this.state.players.values());
    const playerHands = distributeCards(
      playersArray.map(player => ({
        playerName: player.username,
        hand: player.hand ? Array.from(player.hand) : []
      })),
      deck
    );

    //
    // Assign the player hands to the players in the game state
    //

    for (const player of this.state.players.values()) {
      const playerHand = playerHands.find((hand) => hand.playerName === player.username);
      if (playerHand) {
        player.hand = new ArraySchema(...playerHand.hand);
      }
    }

    this.state.currentTurn = this.state.playerUsernames[this.state.nextPlayerIndex]


    this.state.rounds[this.state.rounds.length - 1].moves = new MapSchema<Moves>();
    this.state.rounds[this.state.rounds.length - 1].winningCards = new ArraySchema<PlayedCard>();
    this.state.rounds[this.state.rounds.length - 1].roundStatus = "in_progress";

    this.broadcastGameState()
  }

  handlePlayCard(client: Client, message: { cardName: string }) {
    const player = this.state.players.get(client.sessionId);
    if (!player || this.state.nextPlayerIndex !== Array.from(this.state.players.keys()).indexOf(client.sessionId)) return;

    const currentRound = this.state.rounds[this.state.rounds.length - 1];
    if (!currentRound) return;
    
    const moveKey = String(this.state.moveNumber);

    // Create the move if it doesn't exist yet
    if (!currentRound.moves.has(moveKey)) {
      currentRound.moves.set(moveKey, new Moves());
    }

    const move = currentRound.moves.get(moveKey);
    const playedCard = new PlayedCard();
    playedCard.playerName = player.username;
    playedCard.cardName = message.cardName;
    playedCard.rank = getCardRank(message.cardName);
    playedCard.suit = getCardSuit(message.cardName);
    playedCard.value = getCardValue(message.cardName);
    playedCard.point = getCardPoints(message.cardName);
    playedCard.bidIndex = (move!.bids!.length);

    move?.bids.push(playedCard);

    // Remove played card correctly from player's hand
    const cardIndex = player.hand.indexOf(message.cardName);
    if (cardIndex !== -1) {
      player.hand.splice(cardIndex, 1);
    }

    // Advance to next player or evaluate the round
    const allPlayersPlayed = move?.bids.length === this.state.players.size;
    if (allPlayersPlayed) {
      this.evaluateMove();
    } else {
      this.state.nextPlayerIndex = (this.state.nextPlayerIndex + 1) % this.state.players.size;
      this.state.currentTurn = this.state.playerUsernames[this.state.nextPlayerIndex];
    }

    this.broadcastGameState();
    console.log("playedCard", message.cardName);
  }

  evaluateMove() {
    const currentRound = this.state.rounds[this.state.rounds.length - 1];
    if (!currentRound) return;

    const currentMoveNumber = this.state.moveNumber; // use current before incrementing
    const moveKey = String(currentMoveNumber);
    const move = currentRound.moves.get(moveKey);

    // Wait until all players have played this move
    if (!move || move.bids.length < this.state.players.size) return;

    // Collect all played cards (bids) across all players for the current move
    const allBids: IBids[] = move.bids.map(bid => ({ ...bid, bidIndex: String(bid.bidIndex) }));

    // If no cards were played, return early
    if (allBids.length === 0) return;

    // Determine the winner of this move and save winning card
    const { winningCard, moveWinner } = calculateMoveWinner(allBids)!;

    const winningPlayedCard = new PlayedCard();
    winningPlayedCard.cardName = winningCard.cardName;
    winningPlayedCard.playerName = winningCard.playerName;
    winningPlayedCard.rank = winningCard.rank;
    winningPlayedCard.suit = winningCard.suit;
    winningPlayedCard.value = winningCard.value;
    winningPlayedCard.point = winningCard.point;
    winningPlayedCard.bidIndex = winningCard.bidIndex;
    currentRound.winningCards.push(winningPlayedCard);

    console.log("Move completed:", {
      moveNumber: this.state.moveNumber,
      moveWinner,
      winningCard: winningCard.cardName,
    });

    // Move completed, increment move number
    this.state.moveNumber++;

    // If this was the last move (5 total), complete the round
    if (this.state.moveNumber === 5) {
      const lastWinningCard = currentRound.winningCards[currentRound.winningCards.length - 1];
      currentRound.roundWinner = lastWinningCard.playerName;

      // Add points for the round winner
      const winnerPlayer = this.state.players.get(lastWinningCard.playerName);
      if (winnerPlayer) {
        winnerPlayer.score += calculateRoundPoints(currentRound.winningCards as any);
      }

      currentRound.roundStatus = "complete";

      console.log("Round completed:", {
        roundNumber: currentRound.roundNumber,
        roundWinner: lastWinningCard.playerName,
        totalScore: winnerPlayer?.score,
      });

      // Proceed to next phase
      if (this.checkGameOver()) {
        this.endGame();
      } else {
        this.startNextRound();
      }

    } else {
      // Prepare for next move
      this.state.nextPlayerIndex = this.advanceTurn();
      this.state.currentTurn = this.state.playerUsernames[this.state.nextPlayerIndex];
    }

    this.broadcastGameState();
  }

  checkGameOver(): boolean {
    for (const player of this.state.players.values()) {
      if (player.score >= 50) {
        this.state.gameWinner = player.username;
        this.state.gameStatus = "complete";
        return true;
      }
    }
    return false;
  }

  startNextRound() {
    this.state.nextPlayerIndex = this.advanceTurn();
    this.state.roundStatus = "in_progress";
  }

  advanceTurn(): number {
    const playersArray = Array.from(this.state.players.keys()); // Convert MapSchema to array
    const winnerIndex = playersArray.indexOf(this.state.rounds[this.state.rounds.length - 1].roundWinner);
    if (winnerIndex === -1) return this.state.nextPlayerIndex; // No winner found, return current index

    return (winnerIndex + 1) % playersArray.length;
  }

  endGame() {
    this.broadcast("game_over", { winner: this.state.gameWinner });
    this.disconnect();
  }

  override async onLeave(client: Client, consented: boolean) {
    try {
      // Flag the player as inactive for other players
      this.state.players.get(client.sessionId)!.active = false;

      //
      // If player leaves voluntarily, remove them from the game
      //

      if (consented) {
        this.state.players.delete(client.sessionId);
        console.log(`Player ${client.sessionId} left the game.`);
        return;
      }

      //
      // If player left the game involuntarily, attempt to reconnect within 60 seconds, 
      // If reconnection is successful, flag player as active
      //
      await this.allowReconnection(client, 60);
      this.state.players.get(client.sessionId)!.active = true;

    } catch (error: any) {
      throw new Error("Reconnection failed: " + error.message);
    }
  }
}
