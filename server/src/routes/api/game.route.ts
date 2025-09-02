import { Router } from "express";
import { verifyToken,} from "../../middleware/auth"
import { createCustomGameRoom, createOrJoinQuickGameRoom, queryRooms } from "../../controllers/game.controller";

export const gameRouter = Router();

gameRouter.route("/create-custom")
    .post(verifyToken, createCustomGameRoom)

gameRouter.route("/create-quick-room")
    .post(verifyToken, createOrJoinQuickGameRoom)

gameRouter.route("/all-rooms")
    .get(queryRooms)
