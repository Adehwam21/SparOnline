import Joi from "joi";
import { IRegisterUserInput } from "../types/user";

export const createUserInput = Joi.object<IRegisterUserInput>({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})

export const loginUserInput = Joi.object({
    username: Joi.string().email().required(),
    password: Joi.string().required()})
