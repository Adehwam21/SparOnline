import { Response, Request} from 'express';
import { ICreateGameInput } from '../types/game';
import {createGameInput} from '../validation/game';
import { matchMaker } from 'colyseus';


export const createGameRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomName, maxPlayers, maxPoints, variant, roomType, creator, entryFee, bettingEnabled } = req.body;
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
            gameState: {}, // Optional initial state
        };

        const savedGameRoom = await req.context!.services!.game.createGame(initialRoom);
        if (!savedGameRoom || !savedGameRoom.roomUUID) {
            res.status(500).json({ message: 'Error saving game room to database' });
            return;
        }

        const roomUUID = savedGameRoom.roomUUID.toString();
        const roomMongoId = savedGameRoom._id.toString();

        // Step 2: Create the Colyseus room with roomUUID
        const colyseusRoom = await matchMaker.create(`${roomType}`, {
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
        });

        if (!colyseusRoom || !colyseusRoom.room?.roomId) {
            res.status(500).json({ message: 'Error creating Colyseus room' });
            return;
        }

        const colyseusRoomId = colyseusRoom.room.roomId;

        // Update the MongoDB record with colyseusRoomId
        await req.context!.services!.game.updateGame(roomMongoId, {colyseusRoomId});

        const link = `${req.protocol}://${req.get('host')}/game/${colyseusRoomId}`;
            res.status(201).json({
            roomInfo: { ...savedGameRoom.toObject?.(), colyseusRoomId },
            colyseusRoomId,
            roomLink: link,
            message: 'Game room created successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

