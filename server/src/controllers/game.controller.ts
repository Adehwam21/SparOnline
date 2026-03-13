import { Response, Request } from "express";
import { ICreateGameInput, ICreateVSComputerInput } from "../types/game";
import { createGameInput, createVSComputerInput } from "../validation/game";
import { matchMaker } from "colyseus";

// import { randomUUID } from "crypto";

 
matchMaker.controller.DEFAULT_CORS_HEADERS = {
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': process.env.CLIENT_URL ?? "http://localhost:5173",
    'Access-Control-Max-Age': '2592000',
    // ...
}

export const createCustomGameRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomName, maxPlayers, maxPoints, variant, roomType, creator, entryFee, bettingEnabled, isPrivate } = req.body;
    const { error } = createGameInput.validate(req.body);

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    const initialRoom: ICreateGameInput = {
      roomName,
      maxPlayers,
      maxPoints,
      entryFee,
      bettingEnabled,
      variant,
      creator,
      players: [creator],
      gameState: {},
      isPrivate,
    };

    const savedGameRoom = await req.context!.services!.game.createGame(initialRoom);
    if (!savedGameRoom || !savedGameRoom.roomUUID) {
      res.status(500).json({ message: "Error saving game room to database" });
      return;
    }

    const roomUUID    = savedGameRoom.roomUUID.toString();
    const roomMongoId = savedGameRoom._id.toString();

    const colyseusRoom = await matchMaker.create(`${roomType}`, {
      roomUUID,
      roomName,
      maxPlayers: Number(maxPlayers),
      maxPoints:  Number(maxPoints),
      variant,
      creator,
      players:        [creator],
      playerUsername: creator,
      entryFee,
      bettingEnabled,
      isLocked:  false,
      isPrivate,
    });

    if (!colyseusRoom || !colyseusRoom.room?.roomId) {
      res.status(500).json({ message: "Error creating Colyseus room" });
      return;
    }

    const colyseusRoomId = colyseusRoom.room.roomId;
    await req.context!.services!.game.updateGame(roomMongoId, { colyseusRoomId });

    const link = `${req.protocol}://${req.get("host")}/game/${colyseusRoomId}`;
    res.status(201).json({
      roomInfo: { ...savedGameRoom.toObject?.(), colyseusRoomId },
      colyseusRoomId,
      roomLink: link,
      message:  "Game room created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createOrJoinQuickGameRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { maxPlayers, maxPoints, variant, roomType } = req.body;
    const { error } = createGameInput.validate(req.body);

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    const rooms          = await matchMaker.query({ name: roomType });
    const availableRooms = rooms.filter(
      (room) =>
        room.metadata?.isLocked    === false &&
        room.metadata?.maxPlayers  === Number(maxPlayers) &&
        room.metadata?.maxPoints   === Number(maxPoints) &&
        room.metadata?.variant     === variant &&
        room.metadata?.isPrivate   === false,
    );
    const bestRoom = availableRooms.sort((a, b) => a.clients - b.clients)[0];

    if (bestRoom) {
      const link = `${req.protocol}://${req.get("host")}/game/${bestRoom.roomId}`;
      res.status(201).json({
        colyseusRoomId: bestRoom.roomId,
        roomLink:       link,
        message:        "Quick room joined successfully",
      });
      return;
    }

    return await createCustomGameRoom(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const createOrJoinVSComputerGameRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      maxPoints,
      variant,
      creator,
      botDifficulty = "medium",
    } = req.body;

    // Reuse the existing validator — only validate what's relevant
    const { error } = createVSComputerInput.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    // Persist the room to the database so the game history is recorded
    const initialRoom: ICreateVSComputerInput = {
      roomName:       `${creator}-vs-bot`,
      maxPlayers:     "2",   // always 1 human + 1 bot
      maxPoints:      String(maxPoints),
      entryFee:       0,   // single player is never a betting room
      bettingEnabled: false,
      variant,
      creator,
      players:   [creator],
      gameState: {},
      isPrivate: true,
    };

    const savedGameRoom = await req.context!.services!.game.createGame(initialRoom);
    if (!savedGameRoom || !savedGameRoom.roomUUID) {
      res.status(500).json({ message: "Error saving game room to database" });
      return;
    }

    const roomUUID    = savedGameRoom.roomUUID.toString();
    const roomMongoId = savedGameRoom._id.toString();
    const colyseusRoom = await matchMaker.create("single", {
      roomUUID,
      maxPoints:     Number(maxPoints),
      variant,
      creator,
      botDifficulty, 
      isPrivate:     true,
      isLocked:      true,
    });

    if (!colyseusRoom || !colyseusRoom.room?.roomId) {
      res.status(500).json({ message: "Error creating Colyseus room" });
      return;
    }

    const colyseusRoomId = colyseusRoom.room.roomId;
    await req.context!.services!.game.updateGame(roomMongoId, { colyseusRoomId });

    const link = `${req.protocol}://${req.get("host")}/game/${colyseusRoomId}`;
    res.status(201).json({
      roomInfo: { ...savedGameRoom.toObject?.(), colyseusRoomId },
      colyseusRoomId,
      roomLink: link,
      message:  "Single player room created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const queryRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const customRooms  = await matchMaker.query({ name: "custom" });
    const singlePRooms = await matchMaker.query({ name: "single" });
    const quickRooms   = await matchMaker.query({ name: "quick" });

    if (!customRooms?.length && !singlePRooms?.length && !quickRooms?.length) {
      res.status(404).json({ message: "No rooms found" });
      return;
    }

    res.status(200).json({ message: "Rooms found", customRooms, singlePRooms, quickRooms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No rooms found" });
  }
};