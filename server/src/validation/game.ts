import Joi from "joi";
import { ICreateGameInput, ICreateVSComputerInput} from "../types/game";


export const createGameInput = Joi.object<ICreateGameInput>({
    roomName: Joi.string().required(), // Custom room name
    maxPlayers: Joi.string().required(), // Maximum number of players allowed in the room
    maxPoints: Joi.string().required(), // Maximum points to win the game
    variant: Joi.string().required(), // Game mode (e.g., survival, race)
    creator: Joi.string(), // Store player data
    entryFee: Joi.number().optional(), // Entry fee if betting is enabled
    bettingEnabled: Joi.boolean().optional(), // True if entry fee taken
    roomType: Joi.string(), // Type of game room (e.g. multiplayer, single player)
    gameState: Joi.object().optional(), // Store snapshot of game state
    isPrivate: Joi.boolean().optional()
});

export const createVSComputerInput = Joi.object<ICreateVSComputerInput>({
    roomName: Joi.string().optional(), // Custom room name
    maxPlayers: Joi.string().required(), // Maximum number of players allowed in the room
    maxPoints: Joi.string().required(), // Maximum points to win the game
    variant: Joi.string().required(), // Game mode (e.g., survival, race)
    creator: Joi.string(), // Store player data
    entryFee: Joi.number().optional(), // Entry fee if betting is enabled
    bettingEnabled: Joi.boolean().optional(), // True if entry fee taken
    botDifficulty: Joi.string().required(),
    roomType: Joi.string(), // Type of game room (e.g. multiplayer, single player)
    gameState: Joi.object().optional(), // Store snapshot of game state
    isPrivate: Joi.boolean().optional()
})
