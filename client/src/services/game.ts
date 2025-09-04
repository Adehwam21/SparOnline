import toast from "react-hot-toast";
import axiosInstance from "../config/axiosConfig";
import { errorToastOptions, successToastOptions } from "../types";

type multiplayerConfig = {
    roomName: string, 
    creator:string, 
    variant: string, 
    maxPlayers: string, 
    maxPoints: string
    roomType?: string;
    entryFee?: number;
    bettingEnabled?: boolean;
}

export const createMultiplayerRoom = async (config: multiplayerConfig) => {
    try {
        const response = await axiosInstance.post('/game/create-custom', config);
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

export const createOrJoinQuickRoom = async (metadata: multiplayerConfig) => {
    try {
        const response = await axiosInstance.post('/game/create-quick', metadata);
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

export const createOrSingleRoom = async (metadata: multiplayerConfig) => {
    try {
        const response = await axiosInstance.post('/game/create-quick', metadata);
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

