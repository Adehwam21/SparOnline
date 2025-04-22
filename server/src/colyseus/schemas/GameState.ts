import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

// Player stores individual player data
export class Player extends Schema {
  @type("string") id: string = ""; 
  @type("string") username: string = "";
  @type(["string"]) hand = new ArraySchema<string>(); // Fixed
  @type("number") score: number = 0;
  @type("boolean") active = true; // whether the player is active in the game
}

// PlayedCard represents a single card played in a move
export class PlayedCard extends Schema {
  @type("string") playerName: string = "";
  @type("string") cardName: string = "";
  @type("string") moveIndex?: string = "";
}

// Move represents a player's action in a round
export class Moves extends Schema {
  @type([PlayedCard]) bids = new ArraySchema<PlayedCard>();
  @type("string") moveWinner: string = ""; // Username of the player who won the move 
}

// Round keeps track of moves, status, and winner
export class Round extends Schema {
  @type("number") roundNumber: number = 0;
  @type({ map: Moves }) moves = new MapSchema<Moves>(); // Changed to MapSchema for tracking moves per player
  @type([PlayedCard]) winningCards = new ArraySchema<PlayedCard>(); // List of all the winning card per move in a round
  @type("string") roundWinner: string = ""; // Takes the username of the round winner
  @type("string") roundStatus: string = "pending";
}

// GameState keeps track of the entire game
export class GameState extends Schema {
  // Add this to your room's state or as a private field
  @type("string") roomId: string = ""; // Unique identifier for the room
  @type("number") maxPlayers: number = 4; // Maximum number of players allowed in the room
  @type("number") maxPoints: number = 100; // Maximum points to win the game
  @type("string") creator: string = ""; // Creator of the room
  @type("string") gameMode: string = ""; // Type of game (e.g., "classic", "custom")
  @type("string") gameName: string = ""; // Name of the game
  @type(["string"]) playerUsernames = new ArraySchema<string>(); // List of players in the game
  @type(["string"]) deck = new ArraySchema<string>();
  @type({ map: Player }) players = new MapSchema<Player>(); // Fixed
  @type([Round]) rounds = new ArraySchema<Round>(); // Fixed
  @type("number") moveNumber: number = 0;
  @type("number") nextPlayerIndex: number = 0; // Ensure you check for valid values in logic
  @type("string") currentTurn: string = ""
  @type("string") roundStatus: string = "pending"; 
  @type("string") gameStatus: string = "pending"; 
  @type("string") gameWinner: string = "";
}
