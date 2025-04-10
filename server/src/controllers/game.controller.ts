import { Response, Request} from 'express';
import { ICreateGameInput } from '../types/game';
import {createGameInput} from '../validation/game';
import { matchMaker } from 'colyseus';


export const createGameRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomName, maxPlayers, maxPoints, gameMode, creator } = req.body;

        const { error } = createGameInput.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }

        // Create the Colyseus room
        const colyseusRoom = await matchMaker.createRoom(gameMode, {
            roomName,
            maxPlayers,
            maxPoints,
            gameMode,
            creator,
        });

        if (!colyseusRoom) {
            res.status(500).json({ message: 'Error creating game room' });
            return;
        }
        // Get the roomId from the Colyseus room
        const roomId = colyseusRoom.roomId;

        // Save the room to your MongoDB with the roomId
        const newGameRoom: ICreateGameInput = {
            roomName,
            maxPlayers,
            maxPoints,
            gameMode,
            creator,
            gameState: {}, // Add initial state if needed
        };

        const savedGameRoom = await req.context!.services!.game.createGame(newGameRoom);
        if (!savedGameRoom) {
            res.status(500).json({ message: 'Error saving game room' });
            return;
        }

        const link = `${req.protocol}://${req.get('host')}/game/${roomId}`;
        res.status(201).json({
            roomInfo: savedGameRoom,
            colyseusRoomId: roomId,
            roomLink: link,
            message: 'Game room created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
