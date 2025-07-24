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
const app_1 = require("../types/app");
class GameService extends app_1.IService {
    constructor(props) {
        super(props);
    }
    createGame(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roomName, colyseusRoomId, creator, variant, maxPlayers, maxPoints, entryFee, roomType } = input;
                const gameRoom = yield this.db.GameRoomModel.create({
                    roomName,
                    creator,
                    colyseusRoomId,
                    variant,
                    maxPlayers,
                    maxPoints,
                    entryFee,
                    roomType,
                    gameState: {},
                });
                return gameRoom.toObject();
            }
            catch (e) {
                throw e;
            }
        });
    }
    getGameById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gameRoom = yield this.db.GameRoomModel.findById(id);
                return gameRoom ? gameRoom.toObject() : null;
            }
            catch (e) {
                throw e;
            }
        });
    }
    getAllGames() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gameRooms = yield this.db.GameRoomModel.find({});
                return gameRooms.map((gameRoom) => gameRoom.toObject());
            }
            catch (e) {
                throw e;
            }
        });
    }
    updateGame(id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gameRoom = yield this.db.GameRoomModel.findByIdAndUpdate(id, { $set: input }, { new: true });
                return gameRoom ? gameRoom.toObject() : null;
            }
            catch (e) {
                throw e;
            }
        });
    }
    deleteGame(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gameRoom = yield this.db.GameRoomModel.findByIdAndDelete(id);
                return gameRoom ? gameRoom.toObject() : null;
            }
            catch (e) {
                throw e;
            }
        });
    }
    addPlayerToGame(gameId, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gameRoom = yield this.db.GameRoomModel.findByIdAndUpdate(gameId, { $addToSet: { players: playerId } }, { new: true });
                return gameRoom ? gameRoom.toObject() : null;
            }
            catch (e) {
                throw e;
            }
        });
    }
    removePlayerFromGame(gameId, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gameRoom = yield this.db.GameRoomModel.findByIdAndUpdate(gameId, { $pull: { players: playerId } }, { new: true });
                return gameRoom ? gameRoom.toObject() : null;
            }
            catch (e) {
                throw e;
            }
        });
    }
    updateGameState(gameId, gameState) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gameRoom = yield this.db.GameRoomModel.findByIdAndUpdate(gameId, { $set: { gameState } }, { new: true });
                return gameRoom ? gameRoom.toObject() : null;
            }
            catch (e) {
                throw e;
            }
        });
    }
    resetGameState(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gameRoom = yield this.db.GameRoomModel.findByIdAndUpdate(gameId, { $set: { gameState: {} } }, { new: true });
                return gameRoom ? gameRoom.toObject() : null;
            }
            catch (e) {
                throw e;
            }
        });
    }
}
exports.default = GameService;
