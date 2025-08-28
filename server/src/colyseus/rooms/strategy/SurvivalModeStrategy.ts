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
    const deduction = calculateRoundPoints(Array.from(round.winningCards) as PlayedCard[]);
    nextPlayer.score -= deduction;
  }

  checkGameOver(players: Map<string, Player>, _maxPoints: number): string | null {
    const alive = [...players.values()].filter(p => !p.eliminated && p.score > 0);
    return alive.length === 1 ? alive[0].username : null;
  }

  applyPenalty(
    player: Player,
    config: {
      minPoints: number;
      nextEliminationRank: () => number;
      bannedUsers: Set<string>;
      eliminatedPlayers: Set<string>;
    }): boolean {

    player.score -= 3;

    if (player.score <= config.minPoints) {
      player.active = false;
      player.eliminated = true;
      player.rank = config.nextEliminationRank();
      player.hand.clear();
      player.bids.clear();

      config.bannedUsers.add(player.username);
      config.eliminatedPlayers.add(player.username);

      return true;
    }

    return false;
  }

}
