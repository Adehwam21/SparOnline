import { colyseus } from "use-colyseus";
import { GameState } from "../redux/slices/gameSlice";
import { COLYSEUS_WS_URL } from "../constants";

export const {
    client,
    connectToColyseus,
    disconnectFromColyseus,
    useColyseusRoom,
    useColyseusState,
} = colyseus<GameState>(COLYSEUS_WS_URL);