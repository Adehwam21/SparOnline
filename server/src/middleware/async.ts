import { Request, Response, NextFunction } from "express";


const asyncMiddleware = (fn: Function) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await fn(req, res)
        } catch (error) {
            next(error);
        }
    }
};

export default asyncMiddleware;