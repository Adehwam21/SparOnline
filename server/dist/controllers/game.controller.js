"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGameRoom = void 0;
const game_1 = require("../validation/game");
const colyseus_1 = require("colyseus");
const createGameRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomName, maxPlayers, maxPoints, variant, roomType, creator, entryFee, bettingEnabled } = req.body;
        const { error } = game_1.createGameInput.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }
        // Create the Colyseus room
        const colyseusRoom = yield colyseus_1.matchMaker.create(`${roomType}`, {
            roomName,
            maxPlayers: Number(maxPlayers),
            maxPoints: Number(maxPoints),
            variant,
            creator,
            players: [creator],
            playerUsername: creator,
            entryFee,
            bettingEnabled,
        });
        if (!colyseusRoom) {
            res.status(500).json({ message: 'Error creating game room' });
            return;
        }
        // Get the roomId from the Colyseus room
        const colyseusRoomId = colyseusRoom.room.roomId;
        // Save the room to your MongoDB with the roomId
        const newGameRoom = {
            colyseusRoomId,
            roomName,
            maxPlayers,
            maxPoints,
            entryFee,
            bettingEnabled,
            variant,
            creator,
            players: [creator],
            gameState: {}, // Add initial state if needed
        };
        const savedGameRoom = yield req.context.services.game.createGame(newGameRoom);
        if (!savedGameRoom) {
            res.status(500).json({ message: 'Error saving game room' });
            return;
        }
        const link = `${req.protocol}://${req.get('host')}/game/${colyseusRoomId}`;
        res.status(201).json({
            roomInfo: savedGameRoom,
            colyseusRoomId,
            roomLink: link,
            message: 'Game room created successfully'
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createGameRoom = createGameRoom;
