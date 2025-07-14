import { RaceModeStrategy } from "../strategies/RaceMode";
import { GameModeStrategy } from "../strategies/BaseStrategy";

export class GameModeStrategyFactory {
  static getStrategy(gameMode: string): GameModeStrategy {
    switch (gameMode) {
      case "race":
        return new RaceModeStrategy();
      // Add other strategies here
      default:
        throw new Error(`Unknown mode: ${gameMode}`);
    }
  }
}
