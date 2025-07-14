import { Types } from 'mongoose';
export interface Player {
    username: string; // Player's username 
    score: number; // Player's score
    hand: string[]; // Cards in hand (hidden from other players)
}

export interface IGameRoom {
    roomId: string;
    colyseusRoomId?: string;
    roomName: string;
    maxPlayers: string; // Maximum number of players allowed in the room
    maxPoints: string; // Maximum points to win the game
    variant: string; // Type of game (e.g., "classic", "custom")
    creator: string; // Store player data
    players: string[]; // List of players in the game
    roomType?: string,
    entryFee?: boolean,
    gameState?: any; // Store snapshot of game state
    createdAt: Date;
}


export interface ICreateGameInput {
    colyseusRoomId?: string; // Unique identifier for the room
    roomName: string;
    maxPlayers: string; // Maximum number of players allowed in the room
    maxPoints: string; // Maximum points to win the game
    variant: string; // Type of game (e.g., "classic", "custom")
    players: string[]; // List of players in the game
    creator: string; // Store player id
    roomType?: string;
    entryFee?: number;
    gameState: any
    
}

export interface IBids {
    playerName: string;
    cardName: string;
    bidIndex: string;
}

export interface IWinningCard {
    cardName:string;
    suit: string;
    rank: string;
    value: number;
    point: number;
    playerName: string;
    bidIndex: number;
}