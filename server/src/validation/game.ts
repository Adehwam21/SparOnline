import Joi from "joi";
import { ICreateGameInput } from "../types/game";


export const createGameInput = Joi.object<ICreateGameInput>({
    roomName: Joi.string().required(),
    maxPlayers: Joi.string().required(), // Maximum number of players allowed in the room
    maxPoints: Joi.string().required(), // Maximum points to win the game
    variant: Joi.string().required(), // Type of game (e.g., "classic", "custom")
    creator: Joi.string(), // Store player data
    entryFee: Joi.string().optional(),
    bettingEnabled: Joi.boolean().optional(),
    roomType: Joi.string(),
    gameState: Joi.object(), // Store snapshot of game state
});
