import mongoose, { Document, Schema, Model } from "mongoose";
import { v4 as uuidv4} from "uuid";
import { IGameRoom } from "../types/game";


export interface IGameRoomDocument extends Document, IGameRoom { }
export interface IGameRoomModel extends Model<IGameRoomDocument> { }

// Define the schema
const GameRoomSchema = new Schema<IGameRoomDocument>(
  {
    roomUUID: { type: String, required: true, default: uuidv4, unique: true, index: true },
    colyseusRoomId: {type: String, unique: false},
    roomName: {type: String, required: true},
    creator: { type: String, required: true, ref: "User" }, // Creator of the game room
    players: { type: [String], required: true }, // List of players in the game
    roomType: {type: String, enum: ["mpr", "spr"], requied: true},
    variant: { type: String, enum: ["race", "survival"], required: false, default: "race"}, // Type of game (e.g., "classic", "custom")
    maxPlayers: { type: String, required: true }, // Maximum number of players allowed in the room
    maxPoints: { type: String, required: true }, // Maximum points to win the game
    gameState: { type: Object, required: false },
    entryFee: {type: Number, required: false},
    createdAt: { type: Date, default: Date.now()}
  },
  { timestamps: true }
);

// Create the model
export const GameRoomModel = mongoose.model<IGameRoomDocument, IGameRoomModel>("GameRoom", GameRoomSchema);


