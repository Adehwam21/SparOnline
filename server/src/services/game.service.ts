import { IGameRoom, ICreateGameInput } from "../types/game";
import { IAppContext, IService } from "../types/app";
import { Types } from "mongoose";

export default class GameService extends IService {
    constructor(props: IAppContext) {
        super(props);
    }

    async createGame(input: ICreateGameInput): Promise<IGameRoom | null> {
        try {
            const { roomName, colyseusRoomId, creator, variant, maxPlayers, maxPoints, entryFee, roomType } = input;
            const gameRoom = await this.db.GameRoomModel.create({
                roomName,
                creator,
                colyseusRoomId,
                variant,
                maxPlayers,
                maxPoints,
                entryFee,
                roomType,
                gameState: {},
            });
            return gameRoom.toObject();
        } catch (e) {
            throw e;
        }
    }
    async getGameById(id: string): Promise<IGameRoom | null> {
        try {
            const gameRoom = await this.db.GameRoomModel.findById(id);
            return gameRoom ? gameRoom.toObject() : null;
        } catch (e) {
            throw e;
        }
    }
    async getAllGames(): Promise<IGameRoom[]> {
        try {
            const gameRooms = await this.db.GameRoomModel.find({});
            return gameRooms.map((gameRoom) => gameRoom.toObject());
        } catch (e) {
            throw e;
        }
    }
    async updateGame(id: string, input: Partial<ICreateGameInput>): Promise<IGameRoom | null> {
        try {
            const gameRoom = await this.db.GameRoomModel.findByIdAndUpdate(
                id,
                { $set: input },
                { new: true }
            );
            return gameRoom ? gameRoom.toObject() : null;
        } catch (e) {
            throw e;
        }
    }
    async deleteGame(id: string): Promise<IGameRoom | null> {
        try {
            const gameRoom = await this.db.GameRoomModel.findByIdAndDelete(id);
            return gameRoom ? gameRoom.toObject() : null;
        } catch (e) {
            throw e;
        }
    }
    async addPlayerToGame(gameId: string, playerId: string): Promise<IGameRoom | null> {
        try {
            const gameRoom = await this.db.GameRoomModel.findByIdAndUpdate(
                gameId,
                { $addToSet: { players: playerId } },
                { new: true }
            );
            return gameRoom ? gameRoom.toObject() : null;
        } catch (e) {
            throw e;
        }
    }
    async removePlayerFromGame(gameId: string, playerId: string): Promise<IGameRoom | null> {
        try {
            const gameRoom = await this.db.GameRoomModel.findByIdAndUpdate(
                gameId,
                { $pull: { players: playerId } },
                { new: true }
            );
            return gameRoom ? gameRoom.toObject() : null;
        } catch (e) {
            throw e;
        }
    }
    async updateGameState(gameId: string, gameState: object): Promise<IGameRoom | null> {
        try {
            const gameRoom = await this.db.GameRoomModel.findByIdAndUpdate(
                gameId,
                { $set: { gameState } },
                { new: true }
            );
            return gameRoom ? gameRoom.toObject() : null;
        } catch (e) {
            throw e;
        }
    }
    async resetGameState(gameId: string): Promise<IGameRoom | null> {
        try {
            const gameRoom = await this.db.GameRoomModel.findByIdAndUpdate(
                gameId,
                { $set: { gameState: {} } },
                { new: true }
            );
            return gameRoom ? gameRoom.toObject() : null;
        } catch (e) {
            throw e;
        }
    }
}