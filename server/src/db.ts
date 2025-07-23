import mongoose, { connect } from 'mongoose';
import dotenv from 'dotenv';
import { UserModel, IUserModel } from './models/user.model';
import { GameRoomModel, IGameRoomModel } from './models/game.model';
import { Config } from './types/config';
import { TransactionModel, ITransactionModel } from './models/transaction.model';



dotenv.config();

export interface IDb {
    connection: typeof mongoose;
    UserModel: IUserModel;
    GameRoomModel: IGameRoomModel;
    TransactionModel: ITransactionModel;
    
}

export default async function InitDB(config: Config["db"]): Promise<IDb> {
    try {
        await connect(config.uri, { autoIndex: false });
        console.log("Database connected");

        await UserModel.createCollection();
        await GameRoomModel.createCollection();
        await TransactionModel.createCollection();


        return {
            connection: mongoose,
            UserModel,
            GameRoomModel,
            TransactionModel
        };
    } catch (e) {
        console.error("Failed to connect to DB", e);
        throw e;
    }
}