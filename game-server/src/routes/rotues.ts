import { Router } from "express";
import { authRouter } from "./api/auth.route";

const routes = Router()

routes.use('/auth', authRouter);


export default routes;