import dotenv from "dotenv";
import { Config } from "../types/config";
dotenv.config();

const config: Config = {
    app: {
        env: "production",
        name: "guess-what-backend",
        port: process.env.PORT as unknown as number,
    },
    auth: {
        secret: process.env.JWT_SECRET as string,
        refresh: process.env.REFRESH_SECRET as string,
        expiresIn: "1d",
    },
    db: {
        uri: process.env.PROD_MONGO_URI || "",
    },
};

export default config;