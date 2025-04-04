import * as express from 'express';
import { IAppContext } from "../app";
import { _User } from '../user';

declare global {
  namespace Express {
    interface Request {
      context: IAppContext;
      user: _User;
    }
  }
}
