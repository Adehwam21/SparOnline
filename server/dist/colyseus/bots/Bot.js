"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = exports.Difficulty = void 0;
// /game/bots/BotBase.ts
var Difficulty;
(function (Difficulty) {
    Difficulty["easy"] = "easy";
    Difficulty["medium"] = "medium";
    Difficulty["hard"] = "hard";
})(Difficulty || (exports.Difficulty = Difficulty = {}));
class Bot {
    constructor(difficulty) {
        this.difficulty = difficulty;
    }
}
exports.Bot = Bot;
