import Joi from "joi";
import { IInvestmentInput } from "types/investment";

export const createInvetmentInput = Joi.object<IInvestmentInput>({
        customerID: Joi.string().required(),
        details: Joi.object({
            name: Joi.string().required(),
            investmentType: Joi.string().required(),
            amount: Joi.number().required(),
            profitRate: Joi.number().required(),
            duration: Joi.number(),
            startDate: Joi.date(),
            endDate: Joi.date(),
            status: Joi.string()
        })
    }
)