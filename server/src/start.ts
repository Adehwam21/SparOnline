import "dotenv/config";

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { Config } from "./types/config";
import customError from "./middleware/error";
import { IAppContext } from "./types/app";
import InitDB from "./db";
import initServices from "./services/index";
import logger from "./logger";
import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes/rotues";
import { createGameServer } from "./colyseus/gameServer";
import { playground } from "@colyseus/playground";

// Global AppContext for game rooms.
export const appContext: IAppContext =  {};


export default async function start(config: Config) {
  try {
    // initialize server and services
    appContext.db = await InitDB(config.db);
    appContext.services = await initServices(appContext);
    const app = express();
    app.use(cors({
      origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:3000",
      "http://192.168.43.241:5173",
      "http://192.168.43.48:5173",
      ],
      credentials: true
    }));
    app.use(morgan('dev'));
    app.use(express.json(), bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    app.use((req: Request, res: Response, next: NextFunction) => {
      req.context = appContext;
      next();
    });


    // Middleware to log request details
    app.use((req, res, next) => {
      const start = process.hrtime();

      res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = (seconds * 1000 + nanoseconds / 1e6).toFixed(3); // in milliseconds
        const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration} ms - ${res.get('Content-Length') || 0}`;

        logger.info({
          message: logMessage,
          type: "service log"
        });
      });

      next();
    });

    //use routes
    app.use("/api/v1", routes);

    app.use("/ping", (req, res) => {
      res.status(200).send("Greeeeeen! ✅");
    });

    app.use(customError);
    app.use("/colyseus-playground", playground());

    // Create and start Colyseus + Express server
    const { server } = createGameServer(app);
    server.listen(config.app.port, () => {
      console.log(`🚀 Express API running at http://0.0.0.0:${config.app.port}`);
      console.log(`🎮 Colyseus WebSocket server running on ws://0.0.0.0:${config.app.port}`);
    });
  } catch (err) {
    console.error(err);
  }
}