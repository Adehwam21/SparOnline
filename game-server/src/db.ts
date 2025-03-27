import { connect } from 'mongoose';
import dotenv from 'dotenv';
import { UserModel, IUserModel } from './models/user.model';
import { Config } from './types/config';



dotenv.config();

export interface IDb {
    UserModel: IUserModel;
    
}

export default async function InitDB(config: Config["db"]): Promise<IDb> {
    try {
        await connect(config.uri, { autoIndex: false });
        console.log("Database connected");

        await UserModel.createCollection();


        return {
            UserModel
        };
    } catch (e) {
        throw e;
    }
}