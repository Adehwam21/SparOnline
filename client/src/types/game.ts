export interface Player {
  id: string; // Unique identifier for the player (session ID)
  username: string;
  score: number;
  rating: number;
  hand: string[]; // Cards in hand (hidden from other players)
  active: boolean; // Indicates if the player is active in the game
}

export interface PlayedCard {
  player: string; // Username of the player who played the card
  cards: string[]; // Card value
}

export interface GameState {
  players: Player[]; // List of players in the game
  bids: PlayedCard[]; // Cards played in the current round
  round: string; // Current round number
  currentTurn: string; // Index of the player whose turn it is
  gameStatus: string; // Indicates if the game has started
  maxPoints: string; // Maximum points to win the game
  gameMode: string; // Type of game (e.g., "classic", "custom")
  gameWinner: string; // Winner of the game
  creator: string; // Store host player username
  gameId: string; // Unique identifier for the game
  gameName: string; // Name of the game
}
