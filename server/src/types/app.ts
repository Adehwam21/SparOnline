import { IDb } from "../db";
import { IServices } from "../services/index";


export interface IAppContext {
    db?: IDb;
    services?: IServices;
}

export class IService {
    db: IDb;
    constructor(context: IAppContext) {
        this.db = context.db!;
    }
}