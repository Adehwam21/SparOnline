"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class RoomMaster {
    constructor(transactionService, gameService) {
        this.transactionService = transactionService;
        this.gameService = gameService;
    }
    mint(userId, amount, transactionType, reason, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.transactionService.creditCoins(userId, amount, transactionType, reason, metadata);
        });
    }
    burn(userId, amount, transactionType, reason, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.transactionService.debitCoins(userId, amount, transactionType, reason, metadata);
        });
    }
    deductEntryFee(players, entryFee, roomId, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.transactionService.deductEntryFee(players, entryFee, roomId, metadata);
        });
    }
    distributePrizePool(payouts, roomId, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.transactionService.distributePrizePool(roomId, payouts, metadata);
        });
    }
    updateWithFinalGameState(gameRoomId, gameState) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.gameService.updateGameState(gameRoomId, gameState);
        });
    }
}
exports.default = RoomMaster;
