/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import axiosInstance from "../config/axiosConfig";
import { errorToastOptions, successToastOptions } from "../types";
import { colyseusSDK } from "../constants";
import { AppDispatch } from "../redux/reduxStore";
import { Room } from "colyseus.js";
import { GameState } from "../types/game";
import { setHand, updatePlayers, updateRound } from "../redux/slices/gameSlice";

type multiplayerConfig = {
    roomName: string, 
    creator:string, 
    gameMode: string, 
    maxPlayers: string, 
    maxPoints: string
}

export const createMultiplayerRoom = async (config: multiplayerConfig) => {
    try {
        const response = await axiosInstance.post('/game/create', config);
        if (response.status !== 201) {
            toast.error('Failed to create game', errorToastOptions);
            throw new Error('Failed to create game');
        }
        const data = response.data;
        toast.success(data!.message, successToastOptions);
        return data;
    } catch (error) {
        console.error('Error creating game:', error);
        throw error;
    }
}

// Colyseus client stuff

export const joinColyseusRoom = async (
    roomId: string,
    playerUsername: string,
    dispatch: AppDispatch
    ): Promise<Room<GameState> | null> => {
    try {
        const room = await colyseusSDK.joinById<GameState>(roomId, { playerUsername });
        if (!room) {
            toast.error("Failed to join room. Try again.", errorToastOptions);
            return null;
        }

        room.onMessage("add_player", (players) => {
            dispatch(updatePlayers(players));
        });

        room.onMessage("update_round", (roundInfo) => {
            dispatch(updateRound(roundInfo.round));
        });

        room.onMessage("update_player_hand", (message) => {
            dispatch(setHand(message.hand));
        });

        (window as any).colyseusRoom = room;

        return room;
    } catch (err) {
        console.error("Failed to join Colyseus room:", err);
        toast.error("Failed to join room. Try again.", errorToastOptions);
        return null;
    }
};
