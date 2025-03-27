import Joi from "joi";
import { IRegisterUserInput } from "types/user";

export const createUserInput = Joi.object<IRegisterUserInput>({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    // profilePhoto: Joi.string().required(),
    prefInvestmentType: Joi.array().items(Joi.string()).required(),
    password: Joi.string().required(),
})

export const loginUserInput = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()})
