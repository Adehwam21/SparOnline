"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("./config");
const start_1 = __importDefault(require("./start"));
dotenv_1.default.config();
(0, start_1.default)(config_1.config);
