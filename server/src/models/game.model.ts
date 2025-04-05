import mongoose, { Document, Schema, Model } from "mongoose";
import { v4 as uuidv4} from "uuid";
import { IGameRoom } from "../types/game";


export interface IGameRoomDocument extends Document, IGameRoom { }
export interface IGameRoomModel extends Model<IGameRoomDocument> { }

// Define the schema
const GameRoomSchema = new Schema<IGameRoomDocument>(
  {
    roomId: { type: String, required: true, default: uuidv4, unique: true, index: true },
    roomName: {type: String, required: true},
    creator: { type: String, required: true }, // Creator of the game room
    gameMode: { type: String, enum: ["race", "survival"], required: true }, // Type of game (e.g., "classic", "custom")
    maxPlayers: { type: String, required: true }, // Maximum number of players allowed in the room
    maxPoints: { type: String, required: true }, // Maximum points to win the game
    gameState: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now()}
  },
  { timestamps: true }
);

// Create the model
export const GameRoomModel = mongoose.model<IGameRoomDocument, IGameRoomModel>("GameSession", GameRoomSchema);


