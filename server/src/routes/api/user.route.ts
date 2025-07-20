import { Router } from "express";
import { verifyToken,} from "../../middleware/auth"
import { getUserProfile } from "../../controllers/user.controller";

export const userRouter = Router();

userRouter.route("/profile")
  .get(verifyToken, getUserProfile);
