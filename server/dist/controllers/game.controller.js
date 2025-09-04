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
exports.queryRooms = exports.createOrJoinQuickGameRoom = exports.createCustomGameRoom = void 0;
const game_1 = require("../validation/game");
const colyseus_1 = require("colyseus");
const createCustomGameRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { roomName, maxPlayers, maxPoints, variant, roomType, creator, entryFee, bettingEnabled, isPrivate } = req.body;
        const { error } = game_1.createGameInput.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }
        const initialRoom = {
            roomName,
            maxPlayers,
            maxPoints,
            entryFee,
            bettingEnabled,
            variant,
            creator,
            players: [creator],
            gameState: {}, // Optional initial state
            isPrivate
        };
        const savedGameRoom = yield req.context.services.game.createGame(initialRoom);
        if (!savedGameRoom || !savedGameRoom.roomUUID) {
            res.status(500).json({ message: 'Error saving game room to database' });
            return;
        }
        const roomUUID = savedGameRoom.roomUUID.toString();
        const roomMongoId = savedGameRoom._id.toString();
        // Create the Colyseus room with roomUUID
        const colyseusRoom = yield colyseus_1.matchMaker.create(`${roomType}`, {
            roomUUID,
            roomName,
            maxPlayers: Number(maxPlayers),
            maxPoints: Number(maxPoints),
            variant,
            creator,
            players: [creator],
            playerUsername: creator,
            entryFee,
            bettingEnabled,
            isLocked: false,
            isPrivate,
        });
        if (!colyseusRoom || !((_a = colyseusRoom.room) === null || _a === void 0 ? void 0 : _a.roomId)) {
            res.status(500).json({ message: 'Error creating Colyseus room' });
            return;
        }
        const colyseusRoomId = colyseusRoom.room.roomId;
        // Update the MongoDB record with colyseusRoomId
        yield req.context.services.game.updateGame(roomMongoId, { colyseusRoomId });
        const link = `${req.protocol}://${req.get('host')}/game/${colyseusRoomId}`;
        res.status(201).json({
            roomInfo: Object.assign(Object.assign({}, (_b = savedGameRoom.toObject) === null || _b === void 0 ? void 0 : _b.call(savedGameRoom)), { colyseusRoomId }),
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
exports.createCustomGameRoom = createCustomGameRoom;
const createOrJoinQuickGameRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { maxPlayers, maxPoints, variant, roomType } = req.body;
        const { error } = game_1.createGameInput.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }
        const rooms = yield colyseus_1.matchMaker.query({ name: roomType });
        const availableRooms = rooms.filter(room => {
            var _a, _b, _c, _d, _e;
            return ((_a = room.metadata) === null || _a === void 0 ? void 0 : _a.isLocked) === false &&
                ((_b = room.metadata) === null || _b === void 0 ? void 0 : _b.maxPlayers) === Number(maxPlayers) &&
                ((_c = room.metadata) === null || _c === void 0 ? void 0 : _c.maxPoints) === Number(maxPoints) &&
                ((_d = room.metadata) === null || _d === void 0 ? void 0 : _d.variant) === variant &&
                ((_e = room.metadata) === null || _e === void 0 ? void 0 : _e.isPrivate) === false;
        });
        const bestRoom = availableRooms.sort((a, b) => a.clients - b.clients)[0];
        if (bestRoom) {
            console.log("Joining existing room:", bestRoom.roomId);
            const colyseusRoomId = bestRoom.roomId;
            const link = `${req.protocol}://${req.get("host")}/game/${colyseusRoomId}`;
            res.status(201).json({
                colyseusRoomId,
                roomLink: link,
                message: "Quick room joined successfully",
            });
            return;
        }
        // No existing room found → create a new one
        return yield (0, exports.createCustomGameRoom)(req, res);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createOrJoinQuickGameRoom = createOrJoinQuickGameRoom;
const queryRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customRooms = yield colyseus_1.matchMaker.query({ name: "custom" });
        const singlePRooms = yield colyseus_1.matchMaker.query({ name: "single" });
        const quickRooms = yield colyseus_1.matchMaker.query({ name: "quick" });
        if (!(customRooms === null || customRooms === void 0 ? void 0 : customRooms.length) && !(singlePRooms === null || singlePRooms === void 0 ? void 0 : singlePRooms.length) && !(quickRooms === null || quickRooms === void 0 ? void 0 : quickRooms.length)) {
            res.status(404).json({ message: "No rooms found" });
            return;
        }
        res.status(200).json({ message: 'Rooms found', customRooms, singlePRooms, quickRooms });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "No rooms found" });
    }
});
exports.queryRooms = queryRooms;
