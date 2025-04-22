import { colyseus } from "use-colyseus";
import { GameState } from "./GameState";
import { COLYSEUS_WS_URL } from "../constants";

export const {
    client,
    connectToColyseus,
    disconnectFromColyseus,
    useColyseusRoom,
    useColyseusState
} = colyseus(COLYSEUS_WS_URL, GameState);