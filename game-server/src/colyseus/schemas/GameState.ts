import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

// Player stores individual player data
export class Player extends Schema {
  @type("string") id: string = ""; 
  @type("string") username: string = "";
  @type(["string"]) hand = new ArraySchema<string>(); // Fixed
  @type(["string"]) bids = new ArraySchema<string>(); // Fixed
  @type("number") score: number = 0;
}

// PlayedCard represents a single card played in a move
export class PlayedCard extends Schema {
  @type("string") username: string = "";
  @type("string") cardName: string = "";
  @type("number") playedAt: number = Date.now(); // Timestamp for AI training
}

// Move represents a player's action in a round
export class Moves extends Schema {
  @type([PlayedCard]) cardsPlayed = new ArraySchema<PlayedCard>();
}

// Round keeps track of moves, status, and winner
export class Round extends Schema {
  @type("number") roundNumber: number = 0;
  @type({ map: Moves }) moves = new MapSchema<Moves>(); // Changed to MapSchema for tracking moves per player
  @type("string") winner: string = ""; // Username of the round winner
  @type("string") roundStatus: string = "pending";
}

// GameState keeps track of the entire game
export class GameState extends Schema {
  @type(["string"]) deck = new ArraySchema<string>();
  @type({ map: Player }) players = new MapSchema<Player>(); // Fixed
  @type([Round]) rounds = new ArraySchema<Round>(); // Fixed
  @type("number") nextPlayerIndex: number = 0; // Ensure you check for valid values in logic
  @type("string") roundStatus: string = "pending";
  @type("string") roundWinner: string = ""; // Takes the username of the round winner
  @type("string") gameStatus: string = "pending"; // Fixed
  @type("string") gameWinner: string = "";
}
