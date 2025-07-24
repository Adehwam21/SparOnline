"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.botNamesByDifficulty = exports.getBotServerUrl = exports.botServerUrl = void 0;
exports.botServerUrl = {
    easy: "http://localhost:8000/api/v1/bots/0",
    medium: "http://localhost:8000/api/v1/bots/1",
    hard: "http://localhost:8000/api/v1/bots/2",
};
const getBotServerUrl = (difficulty) => {
    return exports.botServerUrl[difficulty];
};
exports.getBotServerUrl = getBotServerUrl;
exports.botNamesByDifficulty = {
    easy: "Jack",
    medium: "King",
    hard: "Ace",
};
