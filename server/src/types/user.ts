import { Types } from 'mongoose';

export interface IRegisterUserInput {
  username: string;
  email: string;
  password: string;
  role?: string; 
}

export interface _User {
  _id: Types.ObjectId;
  userID: string;
  email: string;
  username: string;
  role: string;
}

export interface IUser {
  userID: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface IGuest {
  guestID: string;
}
