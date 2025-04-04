import { Router } from "express";
// import { verifyToken,} from "../../middleware/auth"
import { createGameRoom } from "../../controllers/game.controller";

export const gameRouter = Router();

gameRouter.route("/create")
    .post(createGameRoom)
