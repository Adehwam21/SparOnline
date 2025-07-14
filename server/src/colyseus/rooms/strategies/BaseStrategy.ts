// GameModeStrategy.ts
import { GameState, Player } from "../../schemas/GameState";

export interface GameModeStrategy {
  MAX_MOVES: number;
  SECONDS_TO_DISPOSE: number;
  getShuffledDeck(): string[];
  startGame(state: GameState): void;
  handlePlayCard(state: GameState, player: Player, cardName: string): void;
  
}
