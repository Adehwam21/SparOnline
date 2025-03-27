import * as winston from 'winston';

const isProduction = process.env.NODE_ENV === "production";

const transports: winston.transport[] = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.colorize({ all: true }),
            winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
            winston.format.align(),
            winston.format.printf(
                (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
            )
        ),
    }),
];

if (!isProduction) {
    transports.push(
        new winston.transports.File({ filename: "logs/combined.log" }),
        new winston.transports.File({ filename: "logs/errors.log", level: "error" })
    );
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: "AppService" },
    transports, // Properly typed transports
});

export default logger;