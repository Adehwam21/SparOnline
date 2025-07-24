import { IAppContext } from "../types/app";
import GameService from "./game.service";
import UserService from "./user.services";
import TransactionService from "./transaction.service";

export interface IServices {
    user: UserService;
    game: GameService
    transaction: TransactionService;

}

export default async function initServices(context: IAppContext) {
    try {
        return {
            user: new UserService(context),
            game: new GameService(context),
            transaction: new TransactionService(context)
        };
    } catch (e) {
        throw e;
    }
}