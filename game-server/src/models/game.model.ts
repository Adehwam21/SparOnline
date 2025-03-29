import mongoose, { Document, Schema, Model } from "mongoose";
import { IGameRoom } from "../types/game";


export interface IGameRoomDocument extends Document, IGameRoom { }
export interface IGameRoomModel extends Model<IGameRoomDocument> { }

// Define the schema
const GameRoomSchema = new Schema<IGameRoomDocument>(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    players: { type: Object, required: true },
    gameState: { type: Object, required: true },
  },
  { timestamps: true }
);

// Create the model
const GameSessionModel = mongoose.model<IGameRoomDocument, IGameRoomModel>("GameSession", GameRoomSchema);

export default GameSessionModel;

