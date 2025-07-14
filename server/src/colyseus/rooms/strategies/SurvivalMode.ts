// RaceModeStrategy.ts
import { GameModeStrategy } from "./BaseStrategy";
import {
  calculateRoundPoints,
  createDeck,
  shuffleDeck,
  calculateMoveWinner,
  getCardRank,
  getCardSuit,
  getCardValue,
  getCardPoints,
  distributeCards,
} from "../../utils/roomUtils";
import { GameState, PlayedCard, Player, Moves, Round } from "../../schemas/GameState";
import { ArraySchema, MapSchema } from "@colyseus/schema";

export class SurvivalModeStrategy implements GameModeStrategy {
  MAX_MOVES = 5;
  SECONDS_TO_DISPOSE = 60;

  getShuffledDeck(): string[] {
    return shuffleDeck(createDeck());
  }

  startGame(state: GameState): void {
    state.nextPlayerIndex = 0;
    state.roundStatus = "in_progress";
    this.startRound(state);
  }

  private startRound(state: GameState): void {
    const rnd = new Round();
    rnd.roundNumber = state.rounds.length;
    rnd.moves = new MapSchema<Moves>();
    rnd.winningCards = new ArraySchema<PlayedCard>();
    rnd.roundStatus = "in_progress";
    state.rounds.push(rnd);
    state.moveNumber = 0;

    const players = Array.from(state.players.values());
    const hands = distributeCards(
      players.map((p) => ({ playerName: p.username, hand: [] })),
      state.deck
    );

    for (const p of players) {
      const hand = hands.find((h) => h.playerName === p.username);
      p.hand = new ArraySchema(...(hand?.hand ?? []));
      p.bids = new ArraySchema();
    }

    state.currentTurn = state.playerUsernames[state.nextPlayerIndex];
  }

  handlePlayCard(state: GameState, player: Player, cardName: string): void {
    const round = state.rounds.at(-1);
    if (!round) return;

    const key = String(state.moveNumber);
    if (!round.moves.has(key)) round.moves.set(key, new Moves());
    const move = round.moves.get(key)!;

    const pc = new PlayedCard();
    pc.playerName = player.username;
    pc.cardName = cardName;
    pc.rank = getCardRank(cardName);
    pc.suit = getCardSuit(cardName);
    pc.value = getCardValue(cardName);
    pc.point = getCardPoints(cardName);
    pc.bidIndex = move.bids.length;

    player.bids.push(cardName);
    move.bids.push(pc);

    const idx = player.hand.indexOf(cardName);
    if (idx !== -1) player.hand.splice(idx, 1);

    if (move.bids.length === state.players.size) {
      const { winningCard, moveWinner } = calculateMoveWinner(move.bids as any)!;

      const win = new PlayedCard();
      Object.assign(win, winningCard);
      round.winningCards.push(win);
      round.roundWinner = moveWinner;

      state.moveNumber++;

      if (state.moveNumber < this.MAX_MOVES) {
        state.nextPlayerIndex = state.playerUsernames.indexOf(moveWinner);
        state.currentTurn = moveWinner;
      } else {
        round.roundWinner = moveWinner;
        const winnerSessId = Array.from(state.players.entries()).find(([sid, p]) => p.username === moveWinner)?.[0];
        if (winnerSessId) {
          state.players.get(winnerSessId)!.score += calculateRoundPoints(round.winningCards as any);
        }
        round.roundStatus = "complete";

        // End the game else start new round
        if (Array.from(state.players.values()).some((p) => p.score >= state.maxPoints)) {
          state.gameWinner = moveWinner;
          state.gameStatus = "complete";
        } else {
          state.nextPlayerIndex = (state.playerUsernames.indexOf(moveWinner) + 1) % state.playerUsernames.length;
          this.startRound(state);
        }
      }
    } else {
      state.nextPlayerIndex = (state.nextPlayerIndex + 1) % state.players.size;
      state.currentTurn = state.playerUsernames[state.nextPlayerIndex];
    }
  }
}
