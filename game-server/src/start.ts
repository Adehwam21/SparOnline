import "dotenv/config";

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { Config } from "./types/config";
import customError from "./types/error";
import { IAppContext } from "./types/app";
import InitDB from "./db";
import initServices from "./services/index";
import logger from "./logger";
import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes/rotues";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";


export default async function start(config: Config) {
  try {
    // initialize server and services
    const appContext: IAppContext = {};
    appContext.db = await InitDB(config.db);
    appContext.services = await initServices(appContext);
    const app = express();
    app.use(cors({
      origin: [
      FRONTEND_URL,
      "http://localhost:3000",
      "http://192.168.43.48:5173",
      ]
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

    app.use("/health", (req, res) => {
      res.status(200).send("Greeeeeen!");
    });

    app.use(customError);

    // start server
    app.listen(config.app.port, () => {
      console.log(`🚀 Server ready at http://localhost:${config.app.port}`);
    });
  } catch (err) {
    console.error(err);
  }
}