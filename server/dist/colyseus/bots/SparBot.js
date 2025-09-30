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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparBot = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const Bot_1 = require("./Bot");
const roomUtils_1 = require("../utils/roomUtils");
class SparBot extends Bot_1.Bot {
    constructor(difficulty) {
        super(difficulty);
        this.serverUrl = (0, config_1.getBotServerUrl)(difficulty);
        this.name = config_1.botNamesByDifficulty[difficulty];
    }
    playMove(gameState) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (this.difficulty === "easy") {
                    // If difficulty is easy, just play a valid move to avoid penalties
                    const hand = gameState.players["bot"].hand;
                    const round = gameState.rounds.at(-1);
                    if (!round)
                        return;
                    const key = String(gameState.moveNumber);
                    const move = round.moves.get(key);
                    const firstSuit = (_a = move === null || move === void 0 ? void 0 : move.bids[0]) === null || _a === void 0 ? void 0 : _a.suit;
                    let cardToPlay = hand.find((c) => !firstSuit || (0, roomUtils_1.getCardSuit)(c) === firstSuit) || hand[0];
                    if (!cardToPlay)
                        return;
                    return cardToPlay;
                }
                else {
                    // Make a request to external bot servers for a calculated move
                    const response = yield axios_1.default.post(`${this.serverUrl}/play`, gameState);
                    return response.data;
                }
            }
            catch (e) {
                console.log('[Bot Error]: ', e);
            }
        });
    }
}
exports.SparBot = SparBot;
