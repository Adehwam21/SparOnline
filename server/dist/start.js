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
exports.appContext = void 0;
exports.default = start;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_1 = __importDefault(require("./middleware/error"));
const db_1 = __importDefault(require("./db"));
const index_1 = __importDefault(require("./services/index"));
const logger_1 = __importDefault(require("./logger"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const rotues_1 = __importDefault(require("./routes/rotues"));
const gameServer_1 = require("./colyseus/gameServer");
const playground_1 = require("@colyseus/playground");
// Global AppContext for game rooms.
exports.appContext = {};
function start(config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // initialize server and services
            exports.appContext.db = yield (0, db_1.default)(config.db);
            exports.appContext.services = yield (0, index_1.default)(exports.appContext);
            const app = (0, express_1.default)();
            app.use((0, cors_1.default)({
                origin: [
                    process.env.CLIENT_URL || "http://localhost:5173",
                ],
                credentials: true
            }));
            app.use((0, morgan_1.default)('dev'));
            app.use(express_1.default.json(), body_parser_1.default.json());
            app.use(body_parser_1.default.urlencoded({ extended: false }));
            app.use((0, cookie_parser_1.default)());
            app.use((req, res, next) => {
                req.context = exports.appContext;
                next();
            });
            // Middleware to log request details
            app.use((req, res, next) => {
                const start = process.hrtime();
                res.on('finish', () => {
                    const [seconds, nanoseconds] = process.hrtime(start);
                    const duration = (seconds * 1000 + nanoseconds / 1e6).toFixed(3); // in milliseconds
                    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration} ms - ${res.get('Content-Length') || 0}`;
                    logger_1.default.info({
                        message: logMessage,
                        type: "service log"
                    });
                });
                next();
            });
            //use routes
            app.use("/api/v1", rotues_1.default);
            // Ping server
            app.use("/ping", (req, res) => __awaiter(this, void 0, void 0, function* () {
                const start = process.hrtime();
                // Some processing logic
                yield new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 10)));
                const [seconds, nanoseconds] = process.hrtime(start);
                const processingTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed();
                res.status(200).json({
                    status: "Greeeeeen! ✅",
                    serverProcessingTime: `${processingTimeMs}`
                });
            }));
            app.use(error_1.default);
            app.use("/colyseus-playground", (0, playground_1.playground)());
            // Create and start Colyseus + Express server
            const { server } = (0, gameServer_1.createGameServer)(app);
            server.listen(config.app.port, () => {
                console.log(`🚀 Express API running at http://0.0.0.0:${config.app.port}`);
            });
        }
        catch (err) {
            console.error(err);
        }
    });
}
