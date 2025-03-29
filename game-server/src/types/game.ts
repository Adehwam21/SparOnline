export interface IGameRoom {
    roomId: string;
    players: Record<string, any>; // Store player data
    gameState: any; // Store snapshot of game state
    createdAt: Date;
    updatedAt: Date;
}