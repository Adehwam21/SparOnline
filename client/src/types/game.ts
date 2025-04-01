export interface Player {
    id: string;
    username: string;
    score: number;
    bids: string[];
  }
  
  export interface GameState {
    roomName: string;
    players: Player[];
    currentPlayerId: string;
    maxPoints: string;
  }
  