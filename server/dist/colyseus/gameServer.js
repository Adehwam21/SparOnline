"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGameServer = createGameServer;
const colyseus_1 = require("colyseus");
const ws_transport_1 = require("@colyseus/ws-transport");
const http_1 = require("http");
const roomHanlder_1 = require("./roomHanlder");
function createGameServer(app) {
    const server = (0, http_1.createServer)(app);
    const gameServer = new colyseus_1.Server({
        transport: new ws_transport_1.WebSocketTransport({
            server,
            pingInterval: 1000,
            pingMaxRetries: 3,
        }),
    });
    // Register game rooms
    (0, roomHanlder_1.registerRooms)(gameServer);
    return { server, gameServer };
}
