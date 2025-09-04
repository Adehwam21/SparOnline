"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGameInput = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createGameInput = joi_1.default.object({
    roomName: joi_1.default.string().required(), // Custom room name
    maxPlayers: joi_1.default.string().required(), // Maximum number of players allowed in the room
    maxPoints: joi_1.default.string().required(), // Maximum points to win the game
    variant: joi_1.default.string().required(), // Game mode (e.g., survival, race)
    creator: joi_1.default.string(), // Store player data
    entryFee: joi_1.default.number().optional(), // Entry fee if betting is enabled
    bettingEnabled: joi_1.default.boolean().optional(), // True if entry fee taken
    roomType: joi_1.default.string(), // Type of game room (e.g. multiplayer, single player)
    gameState: joi_1.default.object().optional(), // Store snapshot of game state
    isPrivate: joi_1.default.boolean().optional()
});
