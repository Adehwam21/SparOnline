"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGameInput = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createGameInput = joi_1.default.object({
    roomName: joi_1.default.string().required(),
    maxPlayers: joi_1.default.string().required(), // Maximum number of players allowed in the room
    maxPoints: joi_1.default.string().required(), // Maximum points to win the game
    variant: joi_1.default.string().required(), // Type of game (e.g., "classic", "custom")
    creator: joi_1.default.string(), // Store player data
    entryFee: joi_1.default.number().optional(),
    bettingEnabled: joi_1.default.boolean().optional(),
    roomType: joi_1.default.string(),
    gameState: joi_1.default.object(), // Store snapshot of game state
});
