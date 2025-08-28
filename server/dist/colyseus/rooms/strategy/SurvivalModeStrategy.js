"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurvivalModeStrategy = void 0;
const roomUtils_1 = require("../../utils/roomUtils");
class SurvivalModeStrategy {
    awardPoints(round, players) {
        const winnerName = round.roundWinner;
        if (!winnerName)
            return;
        const playerList = [...players.values()];
        const winnerIndex = playerList.findIndex(p => p.username === winnerName);
        if (winnerIndex === -1)
            return;
        const nextPlayer = playerList[(winnerIndex + 1) % playerList.length];
        const deduction = (0, roomUtils_1.calculateRoundPoints)(Array.from(round.winningCards));
        nextPlayer.score -= deduction;
    }
    checkGameOver(players, _maxPoints) {
        const alive = [...players.values()].filter(p => !p.eliminated && p.score > 0);
        return alive.length === 1 ? alive[0].username : null;
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
exports.SurvivalModeStrategy = SurvivalModeStrategy;
