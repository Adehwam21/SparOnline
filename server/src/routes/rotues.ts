import { Router } from "express";
import { authRouter } from "./api/auth.route";
import { gameRouter } from "./api/game.route";

const routes = Router()

routes.use('/auth', authRouter);
routes.use('/game', gameRouter); // Assuming you have a game router to handle game-related routes

export default routes;