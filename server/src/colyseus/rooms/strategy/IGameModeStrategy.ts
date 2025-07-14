import { Round, Player } from "../../schemas/GameState";

export interface IGameModeStrategy {
  awardPoints: (round: Round, players: Map<string, Player>) => void;
  checkGameOver?: (players: any, maxPoints: number) => string | null;
}
