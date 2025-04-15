import { Room, Client } from "colyseus";
import { ArraySchema } from "@colyseus/schema";
import { GameState, Player, Round, PlayedCard, Moves } from "../schemas/GameState";
import { createDeck, shuffleDeck, getCardValue, calculateRoundPoints } from "../utils/roomUtils";

export class RaceGameRoom extends Room<GameState> {
  maxClients: number = 4;

  onCreate(options: { roomId: string; maxPlayers: number; maxPoints: number; creator: string }) {
    this.state = new GameState();
    this.state.roomId = options?.roomId || this.roomId;
    this.maxClients = Number(options.maxPlayers) + 1; // +1 for the host
    this.state.maxPlayers = Number(options.maxPlayers);
    this.state.maxPoints = Number(options.maxPoints);
    this.state.creator = options.creator;
  }

  onJoin(client: Client, options: { playerUsername: string }) {
    // Check for existing player by username
    const existingEntry = Array.from(this.state.players.entries()).find(
      ([, player]) => player.username === options.playerUsername
    );
  
    if (existingEntry) {
      const [oldClientId, player] = existingEntry;
  
      // Remove old entry
      this.state.players.delete(oldClientId);
  
      // Assign new sessionId and re-add player
      player.id = client.sessionId;
      this.state.players.set(client.sessionId, player);
  
      console.log(`Reconnected player: ${player.username}`);
      return;
    }
  
    // Create a new player instance
    const player = new Player();
    player.id = client.sessionId;
    player.username = options.playerUsername;
    this.state.playerUsernames.push(options.playerUsername);
  
    this.state.players.set(client.sessionId, player);
    console.log(`New player joined: ${player.username}`);

    //
    //  Check if the all the players have joined the game and start the game
    //

    if (this.state.players.size === this.state.maxPlayers) {
      this.state.gameStatus = "ready";
      this.broadcast("game_ready", { roomInfo: this.state });
    }
  }
  

  startGame() {
    const deck = shuffleDeck(createDeck());
    const playersArray = Array.from(this.state.players.values());
    const cardsPerPlayer = Math.floor(deck.length / playersArray.length);

    playersArray.forEach((player, index) => {
      player.hand = new ArraySchema(...deck.slice(index * cardsPerPlayer, (index + 1) * cardsPerPlayer));
    });

    for (let i = 0; i < 5; i++) {
      const round = new Round();
      round.roundNumber = i + 1;
      this.state.rounds.push(round);
    }

    this.state.nextPlayerIndex = 0;
    this.state.gameStatus = "in_progress";
  }

  handlePlayCard(client: Client, message: { cardName: string }) {
    const player = this.state.players.get(client.sessionId);
    if (!player || this.state.nextPlayerIndex !== Array.from(this.state.players.keys()).indexOf(client.sessionId)) return;

    const currentRound = this.state.rounds[this.state.rounds.length - 1];
    if (!currentRound) return;

    if (!currentRound.moves.has(client.sessionId)) {
      currentRound.moves.set(client.sessionId, new Moves());
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

    if (currentRound.moves.size === this.state.players.size) {
      this.evaluateRound();
    } else {
      this.advanceTurn();
    }
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

  async onLeave(client: Client, consented: boolean) {
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
