"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRooms = registerRooms;
const SpGameRoom_1 = require("./rooms/sp/SpGameRoom");
const MpGameRoom_1 = require("./rooms/mp/MpGameRoom");
function registerRooms(gameServer) {
    gameServer.define("mpr", MpGameRoom_1.MpGameRoom)
        .on("create", (room) => console.log("room created:", room.roomId))
        .on("dispose", (room) => console.log("room disposed:", room.roomId))
        .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
        .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
    gameServer.define("spr", SpGameRoom_1.SpGameRoom)
        .on("create", (room) => console.log("room created:", room.roomId))
        .on("dispose", (room) => console.log("room disposed:", room.roomId))
        .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
        .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
}
