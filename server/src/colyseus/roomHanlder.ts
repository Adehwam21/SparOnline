import { Server } from "colyseus";
import { RaceGameRoom } from "./rooms/mp/RaceGame";
import { SurvivalGameRoom } from "./rooms/mp/SurvivalGame";

export function registerRooms(gameServer: Server) {
  gameServer.define("race", RaceGameRoom)
    .on("create", (room) => console.log("room created:", room.roomId))
    .on("dispose", (room) => console.log("room disposed:", room.roomId))
    .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
    .on("leave", (room, client) => console.log(client.id, "left", room.roomId));

  gameServer.define("survival", SurvivalGameRoom)
    .on("create", (room) => console.log("room created:", room.roomId))
    .on("dispose", (room) => console.log("room disposed:", room.roomId))
    .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
    .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
  
    gameServer.define("single", SurvivalGameRoom)
    .on("create", (room) => console.log("room created:", room.roomId))
    .on("dispose", (room) => console.log("room disposed:", room.roomId))
    .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
}
