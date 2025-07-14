import { Server } from "colyseus";
import { SpGameRoom } from "./rooms/mp/SpGameRoom";
import { MpGameRoom } from "./rooms/mp/MpGameRoom";

export function registerRooms(gameServer: Server) {
  gameServer.define("mpr", MpGameRoom)
    .on("create", (room) => console.log("room created:", room.roomId))
    .on("dispose", (room) => console.log("room disposed:", room.roomId))
    .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
    .on("leave", (room, client) => console.log(client.id, "left", room.roomId));

  gameServer.define("spr", SpGameRoom)
    .on("create", (room) => console.log("room created:", room.roomId))
    .on("dispose", (room) => console.log("room disposed:", room.roomId))
    .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
    .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
  
}
