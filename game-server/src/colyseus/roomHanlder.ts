import { Server } from "colyseus";
import { RaceGameRoom } from "./rooms/RaceGame";
// import { SurvivalGameRoom } from "./rooms/SurvivalGame";

export function registerRooms(gameServer: Server) {
  gameServer.define("race", RaceGameRoom);
  // gameServer.define("survival", SurvivalGameRoom);
}
