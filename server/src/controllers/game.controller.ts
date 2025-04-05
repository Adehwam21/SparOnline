import { Response, Request} from 'express';
import { ICreateGameInput } from '../types/game';
import {createGameInput} from '../validation/game';


export const createGameRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomName, maxPlayers, maxPoints, gameMode, creator } = req.body;

        const { error } = createGameInput.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }


        const newGameRoom: ICreateGameInput = {
            roomName,
            maxPlayers,
            maxPoints,
            gameMode,
            creator, // Initialize with an empty array of players
            gameState: {}, // Initialize with an empty game state
        };

        // Save the new game room to the database
        
        const savedGameRoom = await req.context!.services!.game.createGame(newGameRoom);
        if (!savedGameRoom) {
            res.status(500).json({ message: 'Error creating game room' });
            return;
        }
        
        const link = `${req.protocol}://${req.get('host')}/game/${savedGameRoom.roomId}`; // Construct the room link


        res.status(201).json({roomInfo: savedGameRoom, roomLink: link, message: 'Game room created successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

};