import production from "./prod";
import development from "./dev";
import dotenv from "dotenv";
import { Config } from "../types/config";
dotenv.config();

export const config: Config =
    process.env.NODE_ENV === "production" ? production : development;