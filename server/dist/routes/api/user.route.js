"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const user_controller_1 = require("../../controllers/user.controller");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.route("/profile")
    .get(auth_1.verifyToken, user_controller_1.getUserProfile);
