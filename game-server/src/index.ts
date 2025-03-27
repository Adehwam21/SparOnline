import dotenv from "dotenv"
import { config } from "./config"
import start from "./start"

dotenv.config()

start(config)