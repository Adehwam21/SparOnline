"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
// import { verifyToken,} from "../../middleware/auth"
const auth_controller_1 = require("../../controllers/auth.controller");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.route("/register")
    .post(auth_controller_1.register);
exports.authRouter.route("/login")
    .post(auth_controller_1.login);
// authRouter.route("/guest")
//     .post(login)
