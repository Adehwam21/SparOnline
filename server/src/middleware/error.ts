import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { stat } from "node:fs/promises";
import { error } from "node:console";
dotenv.config();

const customError = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode ? err.statusCode : 500;

    if (statusCode === 500) {
        res.status(statusCode).json({
            message: "Internal Server Error",
            error: err.message,
            stack: process.env.NODE_ENV === "development" ? err.stack : null,
        });
    }

};

export default customError