import { Types } from 'mongoose';

export interface IRegisterUserInput {
  username: string;
  email: string;
  password: string;
  role?: string | undefined;
  balance?: number | undefined;
}

export interface _User {
  _id: Types.ObjectId;
  userID: string;
  email: string;
  username: string;
  role: string;
  balance: number;
  
}

export interface IUser {
  userID: string;
  username: string;
  email: string;
  password: string;
  role: string;
  balance: number;
}

export interface IGuest {
  guestID: string;
}
