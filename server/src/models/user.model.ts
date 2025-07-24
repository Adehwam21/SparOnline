import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser } from "../types/user";
import { v4 as uuidv4 } from "uuid";


export interface IUserDocument extends Document, IUser { }
export interface IUserModel extends Model<IUserDocument> { }

const UserSchema = new Schema<IUserDocument>({
  userID: { type: String, required: true, default: uuidv4},
  username: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'],
  },
  password: { type: String, required: true, except: true},
  role: {type: String, required: false},
  balance: {type: Number, required:false}
}, { timestamps: true });


export const UserModel = mongoose.model<IUserDocument, IUserModel>("User", UserSchema);
