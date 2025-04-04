import { IAppContext } from "../types/app";
import GameService from "./game.service";
import UserService from "./user.services";

export interface IServices {
    user: UserService;
    game: GameService

}

export default async function initServices(context: IAppContext) {
    try {
        return {
            user: new UserService(context),
            game: new GameService(context)
        };
    } catch (e) {
        throw e;
    }
}