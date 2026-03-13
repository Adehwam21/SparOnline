import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createServer } from "http";
import { Express } from "express";
import { registerRooms } from "./roomHanlder";

export function createGameServer(app: Express) {
  const server = createServer(app);
  const gameServer = new Server({
      server,
  });

  // Register game rooms
  registerRooms(gameServer);

  return { server, gameServer };
}
