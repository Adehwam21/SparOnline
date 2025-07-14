import { IGameModeStrategy } from "./IGameModeStrategy";
import { Round, Player, PlayedCard } from "../../schemas/GameState";
import { calculateRoundPoints } from "../../utils/roomUtils";

export class SurvivalModeStrategy implements IGameModeStrategy {
  awardPoints(round: Round, players: Map<string, Player>) {
    const winnerName = round.roundWinner;
    if (!winnerName) return;

    const playerList = [...players.values()];
    const winnerIndex = playerList.findIndex(p => p.username === winnerName);
    if (winnerIndex === -1) return;

    const nextPlayer = playerList[(winnerIndex + 1) % playerList.length];
    const deduction = calculateRoundPoints(round.winningCards as PlayedCard[]);
    nextPlayer.score = nextPlayer.score - deduction;
  }
}
