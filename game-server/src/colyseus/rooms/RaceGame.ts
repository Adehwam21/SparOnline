import { Room, Client } from "colyseus";
import { ArraySchema } from "@colyseus/schema";
import { GameState, Player, Round, PlayedCard, Move } from "../schemas/GameState";
import { createDeck, shuffleDeck, getCardValue, calculateRoundPoints } from "../utils/roomUtils";

export class RaceGameRoom extends Room<GameState> {
  maxClients = 4;

  onCreate() {
    this.setState(new GameState());
    this.onMessage("play_card", (client, message) => this.handlePlayCard(client, message));
  }

  onJoin(client: Client, options: { username: string }) {
    const player = new Player();
    player.id = client.sessionId;
    player.username = options.username;
    this.state.players.set(client.sessionId, player);
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
      currentRound.moves.set(client.sessionId, new Move());
    }

    const move = currentRound.moves.get(client.sessionId);
    const playedCard = new PlayedCard();
    playedCard.username = player.username;
    playedCard.cardName = message.cardName;
    move?.cardsPlayed.push(playedCard);

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
      const lastCard = move.cardsPlayed[move.cardsPlayed.length - 1];
      if (!highestCard || getCardValue(lastCard.cardName) > getCardValue(highestCard.cardName)) {
        highestCard = lastCard;
        roundWinner = playerId;
      }
    }

    if (roundWinner) {
      currentRound.winner = roundWinner;
      this.state.players.get(roundWinner)!.score += calculateRoundPoints(currentRound);
      this.state.roundWinner = roundWinner;
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
    const winnerIndex = playersArray.indexOf(this.state.roundWinner);

    return (winnerIndex + 1) % playersArray.length;
  }

  endGame() {
    this.broadcast("game_over", { winner: this.state.gameWinner });
    this.disconnect();
  }
}
