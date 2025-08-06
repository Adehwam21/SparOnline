import "dotenv/config";
import * as os from "os";
import * as qrcode from "qrcode-terminal";
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

const frontendQRCode = () => {
  const interfaces = os.networkInterfaces();
  let localIP: string | null = null;

  for (const name in interfaces) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP) break;
  }

  if (localIP) {
      const url = `http://${localIP}:5173`; // change port if needed
      qrcode.generate(url, {small: true}, function (qrcode) {
      console.log("Scan to connect to frontend dev server")
      console.log(qrcode)
    })
  } else {
    console.log("Could not find local IP address.");
  }
}

export default async function start(config: Config) {
  try {
    // initialize server and services
    appContext.db = await InitDB(config.db);
    appContext.services = await initServices(appContext);
    const app = express();
    app.use(cors({
      origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
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

    // Ping server
    app.use("/ping", async (req, res) => {
      const start = process.hrtime();

      // Some processing logic
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 10)));

      const [seconds, nanoseconds] = process.hrtime(start);
      const processingTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed();

      res.status(200).json({
        status: "Greeeeeen! ✅",
        serverProcessingTime: `${processingTimeMs}`
      });
    });

    app.use(customError);
    app.use("/colyseus-playground", playground());

    // Create and start Colyseus + Express server
    const { server } = createGameServer(app);
    frontendQRCode()

    server.listen(config.app.port, () => {
      console.log(`Express API & Colyseus WS server running at http://0.0.0.0:${config.app.port}`);
    });
  } catch (err) {
    console.error(err);
  }
}

