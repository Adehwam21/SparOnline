"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserInput = exports.createUserInput = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createUserInput = joi_1.default.object({
    username: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
    role: joi_1.default.string().valid("admin", "player").optional().default("player"),
});
exports.loginUserInput = joi_1.default.object({
    username: joi_1.default.string().required(),
    password: joi_1.default.string().required()
});
