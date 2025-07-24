"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    app: {
        env: "development",
        name: "guess-what-backend",
        port: process.env.PORT || 8000,
    },
    auth: {
        secret: process.env.JWT_SECRET,
        refresh: process.env.REFRESH_SECRET,
        expiresIn: '7d',
    },
    db: {
        uri: process.env.DEV_MONGO_URI,
    },
};
exports.default = config;
