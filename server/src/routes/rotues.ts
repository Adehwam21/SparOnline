import { Router } from "express";
import { authRouter } from "./api/auth.route";
import { gameRouter } from "./api/game.route";
import { userRouter } from "./api/user.route";

const routes = Router()

routes.use('/auth', authRouter);
routes.use('/game', gameRouter); 
routes.use('/user', userRouter)

export default routes;