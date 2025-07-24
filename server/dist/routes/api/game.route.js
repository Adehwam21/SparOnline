"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const game_controller_1 = require("../../controllers/game.controller");
exports.gameRouter = (0, express_1.Router)();
exports.gameRouter.route("/create")
    .post(auth_1.verifyToken, game_controller_1.createGameRoom);
