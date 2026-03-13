import { Router } from "express";
import { verifyToken,} from "../../middleware/auth"
import {
    createCustomGameRoom,
    createOrJoinQuickGameRoom,
    createOrJoinVSComputerGameRoom,
    queryRooms
} from "../../controllers/game.controller";

export const gameRouter = Router();

gameRouter.route("/create-custom")
    .post(verifyToken, createCustomGameRoom)

gameRouter.route("/create-quick")
    .post(verifyToken, createOrJoinQuickGameRoom)

gameRouter.route("/play-computer")
    .post(verifyToken, createOrJoinVSComputerGameRoom)

gameRouter.route("/all-rooms")
    .get(queryRooms)
