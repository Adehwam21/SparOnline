import { Server } from "colyseus";
import { RoomFactory } from "./rooms/factory/RoomFactory";

export function registerRooms(gameServer: Server) {
  const MpRoomClass = RoomFactory.createMultiplayerRoom();

  gameServer.define("mpr", MpRoomClass)
    .on("create", room => console.log("room created:", room.roomId))
    .on("dispose", room => console.log("room disposed:", room.roomId))
    .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
    .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
  }
