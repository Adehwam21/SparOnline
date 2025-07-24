"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceModeStrategy = void 0;
const roomUtils_1 = require("../../utils/roomUtils");
class RaceModeStrategy {
    awardPoints(round, players) {
        const winnerName = round.roundWinner;
        if (!winnerName)
            return;
        for (const p of players.values()) {
            if (p.username === winnerName) {
                p.score += (0, roomUtils_1.calculateRoundPoints)(round.winningCards);
            }
        }
    }
    checkGameOver(players, maxPoints) {
        for (const p of players.values()) {
            if (p.score >= maxPoints)
                return p.username;
        }
        return null;
    }
    applyPenalty(player, config) {
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
exports.RaceModeStrategy = RaceModeStrategy;
