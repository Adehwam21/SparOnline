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
  }

  checkGameOver(players: Map<string, Player>, maxPoints: number): string | null {
    for (const p of players.values()) {
      if (p.score >= maxPoints) return p.username;
    }
    return null;
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
