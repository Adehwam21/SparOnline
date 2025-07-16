import { Server } from "colyseus";
import { SpGameRoom } from "./rooms/sp/SpGameRoom";
import { MpGameRoom } from "./rooms/mp/MpGameRoom";
import { RaceGameRoom } from "./rooms/mp/RaceGame";
import { SurvivalGameRoom } from "./rooms/mp/SurvivalGame";

export function registerRooms(gameServer: Server) {
  gameServer.define("mpr", MpGameRoom)
    .on("create", (room) => console.log("room created:", room.roomId))
    .on("dispose", (room) => console.log("room disposed:", room.roomId))
    .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
    .on("leave", (room, client) => console.log(client.id, "left", room.roomId));

  // gameServer.define("mpr:race", RaceGameRoom)
  //   .on("create", (room) => console.log("room created:", room.roomId))
  //   .on("dispose", (room) => console.log("room disposed:", room.roomId))
  //   .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
  //   .on("leave", (room, client) => console.log(client.id, "left", room.roomId));

  // gameServer.define("mpr:survival", SurvivalGameRoom)
  //   .on("create", (room) => console.log("room created:", room.roomId))
  //   .on("dispose", (room) => console.log("room disposed:", room.roomId))
  //   .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
  //   .on("leave", (room, client) => console.log(client.id, "left", room.roomId));

  gameServer.define("spr", SpGameRoom)
    .on("create", (room) => console.log("room created:", room.roomId))
    .on("dispose", (room) => console.log("room disposed:", room.roomId))
    .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
    .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
}
