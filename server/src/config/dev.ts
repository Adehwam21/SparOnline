import dotenv from "dotenv";
import { Config } from "../types/config";
dotenv.config();

const config: Config = {
    app: {
        env: "development",
        name: "guess-what-backend",
        port: (process.env.PORT as unknown as number) || 8000,
    },
    auth: {
        secret: process.env.JWT_SECRET as string,
        refresh: process.env.REFRESH_SECRET as string,
        expiresIn: '7d',
    },
    db: {
        uri: process.env.DEV_MONGO_URI as string,
    },
};

export default config;