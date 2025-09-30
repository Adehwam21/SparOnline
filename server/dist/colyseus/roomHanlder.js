"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRooms = registerRooms;
const SpGameRoom_1 = require("./rooms/game-rooms/SpGameRoom");
const CustomRoom_1 = require("./rooms/game-rooms/CustomRoom");
const QuickRoom_1 = require("./rooms/game-rooms/QuickRoom");
function registerRooms(gameServer) {
    gameServer.define("custom", CustomRoom_1.CustomRoom)
        .on("create", (room) => console.log("room created:", room.roomId))
        .on("dispose", (room) => console.log("room disposed:", room.roomId))
        .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
        .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
    gameServer.define("quick", QuickRoom_1.QuickRoom)
        .on("create", (room) => console.log("room created:", room.roomId))
        .on("dispose", (room) => console.log("room disposed:", room.roomId))
        .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
        .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
    gameServer.define("single", SpGameRoom_1.SpGameRoom)
        .on("create", (room) => console.log("room created:", room.roomId))
        .on("dispose", (room) => console.log("room disposed:", room.roomId))
        .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
        .on("leave", (room, client) => console.log(client.id, "left", room.roomId));
}
