import { IGameModeStrategy } from "./IGameModeStrategy";
import { Round, Player, PlayedCard } from "../../schemas/GameState";
import { calculateRoundPoints } from "../../utils/roomUtils";

export class RaceModeStrategy implements IGameModeStrategy {
  awardPoints(round: Round, players: Map<string, Player>) {
    const winnerName = round.roundWinner;
    if (!winnerName) return;

    for (const p of players.values()) {
      if (p.username === winnerName) {
        p.score += calculateRoundPoints(round.winningCards as PlayedCard[]);
      }
    }
  };
}
