import { Player } from "../schemas/GameState";

// /game/bots/BotBase.ts
export enum Difficulty {
  easy = "easy",
  medium = "medium",
  hard = "hard"
}

export interface IBotPlayResponse {
  cardName: string;
}

export interface IBotStrategy {
  comboMode:      boolean; // true = bot is protecting 6s/7s for a late combo
  comboAbandoned: boolean; // flipped mid-round once combo is no longer viable
  comboReason:    string;  // for logging / debugging
}

export abstract class Bot {
  difficulty: keyof typeof Difficulty;


  constructor(difficulty: keyof typeof Difficulty) {
    this.difficulty = difficulty;
  }

  /**
   * Every bot must implement this method to make a decision.
   * @param gameState - the relevant info needed to play the move
   */
  abstract playMove(gameState: any): Promise<IBotPlayResponse>;
}
