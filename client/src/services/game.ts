import toast from "react-hot-toast";
import axiosInstance from "../config/axiosConfig";
import { errorToastOptions, successToastOptions } from "../types";

type MultiplayerConfig = {
  roomName:       string;
  creator:        string;
  variant:        string;
  maxPlayers:     string;
  maxPoints:      string;
  roomType?:      string;
  entryFee?:      number;
  bettingEnabled?: boolean;
};

type SinglePlayerConfig = {
  creator: string;
  maxPlayers: string;
  variant:        string;  // "race" | "survival"
  maxPoints:      string;
  botDifficulty:  string;  // "easy" | "medium" | "hard"
};

export const createMultiplayerRoom = async (config: MultiplayerConfig) => {
  try {
    const response = await axiosInstance.post("/game/create-custom", config);
    if (response.status !== 201) {
      toast.error("Failed to create game", errorToastOptions);
      throw new Error("Failed to create game");
    }
    const data = response.data;
    toast.success(data!.message, successToastOptions);
    return data;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

export const createOrJoinQuickRoom = async (metadata: MultiplayerConfig) => {
  try {
    const response = await axiosInstance.post("/game/create-quick", metadata);
    if (response.status !== 201) {
      toast.error("Failed to create game", errorToastOptions);
      throw new Error("Failed to create game");
    }
    const data = response.data;
    toast.success(data!.message, successToastOptions);
    return data;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

export const createSinglePlayerRoom = async (metadata: SinglePlayerConfig) => {
  try {
    const response = await axiosInstance.post("/game/play-computer", metadata);
    if (response.status !== 201) {
      toast.error("Failed to create game", errorToastOptions);
      throw new Error("Failed to create game");
    }
    const data = response.data;
    toast.success(data!.message, successToastOptions);
    return data;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};
