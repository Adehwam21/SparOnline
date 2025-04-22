import { Room, Client } from "colyseus";
import { ArraySchema, MapSchema } from "@colyseus/schema";
import { GameState, Player, Round, PlayedCard, Moves } from "../schemas/GameState";
import { createDeck, shuffleDeck, getCardValue, calculateRoundPoints, distributeCards } from "../utils/roomUtils";
import { start } from "repl";

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
    const playerHands = distributeCards(playersArray, deck)

    //
    // Assign the player hands to the players in the game state
    //

    for (const player of this.state.players.values()) {
      const playerHand = playerHands.find((hand) => hand.username === player.username);
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

    if (!currentRound.moves.has(String(this.state.moveNumber))) {
      currentRound.moves.set(String(this.state.moveNumber), new Moves());
    }

    const move = currentRound.moves.get(client.sessionId);
    const playedCard = new PlayedCard();
    playedCard.playerName = player.username;
    playedCard.cardName = message.cardName;
    move?.bids.push(playedCard);

    // Remove played card correctly from player's hand
    const cardIndex = player.hand.indexOf(message.cardName);
    if (cardIndex !== -1) {
      player.hand.splice(cardIndex, 1);
    }

    // if (currentRound.moves.size === this.state.players.size) {
    //   this.evaluateRound();
    // } else {
    //   this.advanceTurn();
    // }

    console.log("playedCard")

    this.broadcastGameState();
  }

  evaluateRound() {
    const currentRound = this.state.rounds[this.state.rounds.length - 1];
    if (!currentRound) return;

    let highestCard = null;
    let roundWinner = null;

    for (const [playerId, move] of currentRound.moves.entries()) {
      const lastCard = move.bids[move.bids.length - 1];
      if (!highestCard || getCardValue(lastCard.cardName) > getCardValue(highestCard.cardName)) {
        highestCard = lastCard;
        roundWinner = playerId;
      }
    }

    if (roundWinner) {
      currentRound.roundWinner = roundWinner;
      this.state.players.get(roundWinner)!.score += calculateRoundPoints(currentRound);
    }

    currentRound.roundStatus = "complete";

    if (this.checkGameOver()) {
      this.endGame();
    } else {
      this.startNextRound();
    }
  }

  checkGameOver(): boolean {
    for (const player of this.state.players.values()) {
      if (player.score >= 50) {
        this.state.gameWinner = player.id;
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
