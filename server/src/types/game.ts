export interface Player {
    username: string; // Player's username 
    score: number; // Player's score
    hand: string[]; // Cards in hand (hidden from other players)
}

export interface IGameRoom {
    roomId: string;
    maxPlayers: string; // Maximum number of players allowed in the room
    maxPoints: string; // Maximum points to win the game
    gameMode: string; // Type of game (e.g., "classic", "custom")
    creator: string; // Store player data
    gameState: any; // Store snapshot of game state
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateGameInput {
    roomId: string;
    maxPlayers: string; // Maximum number of players allowed in the room
    maxPoints: string; // Maximum points to win the game
    gameMode: string; // Type of game (e.g., "classic", "custom")
    creator: string; // Store player data
    gameState?: any; // Store snapshot of game state
    createdAt?: Date;
    updatedAt?: Date;
}