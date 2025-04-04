export interface Player {
  username: string;
  score: number;
  rating: number;
  hand: string[]; // Cards in hand (hidden from other players)
}

export interface PlayedCard {
  player: string; // Username of the player who played the card
  card: string; // Card value
}

export interface GameState {
  players: Player[]; // List of players in the game
  bids: PlayedCard[]; // Cards played in the current round
  round: number; // Current round number
  currentTurn: string; // Username of the player whose turn it is
  gameStarted: boolean; // Indicates if the game has started
}
