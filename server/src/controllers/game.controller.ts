import { Response, Request} from 'express';
import { ICreateGameInput } from '../types/game';
import {createGameInput} from '../validation/game';
import { matchMaker } from 'colyseus';


export const createGameRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomName, maxPlayers, maxPoints, variant, roomType, creator, entryFee, bettingEnabled} = req.body;

        const { error } = createGameInput.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }

        // Create the Colyseus room
        const colyseusRoom = await matchMaker.create(`${roomType}`, {
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
        const newGameRoom: ICreateGameInput = {
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

        const savedGameRoom = await req.context!.services!.game.createGame(newGameRoom);
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
