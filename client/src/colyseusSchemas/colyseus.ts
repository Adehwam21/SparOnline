import { colyseus } from "use-colyseus";
import { GameState } from "./GameState";
import { SERVER_BASE_URL} from "../constants";

export const {
    client,
    connectToColyseus,
    disconnectFromColyseus,
    useColyseusRoom,
    useColyseusState
} = colyseus(SERVER_BASE_URL, GameState);