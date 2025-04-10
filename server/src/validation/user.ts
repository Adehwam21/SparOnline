import Joi from "joi";
import { IRegisterUserInput } from "../types/user";

export const createUserInput = Joi.object<IRegisterUserInput>({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid("admin", "player").optional().default("player"),
})

export const loginUserInput = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})
