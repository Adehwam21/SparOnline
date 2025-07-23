import { Schema, type, MapSchema, ArraySchema, Encoder } from "@colyseus/schema";
Encoder.BUFFER_SIZE = 128 * 1024; // 128 KB

// PlayedCard represents a single card played in a move
export class PlayedCard extends Schema {
  @type("string") playerName: string = "";
  @type("string") cardName: string = "";
  @type("string") rank: string = "";
  @type("string") suit: string = "";
  @type("number") value: number = 0;
  @type("number") point: number = 0;
  @type("number") bidIndex: number = 0;
}

// Move represents a player's action in a round
export class Moves extends Schema {
  @type([PlayedCard]) bids = new ArraySchema<PlayedCard>();
  @type("string") moveWinner: string = "";
}

export class Round extends Schema {
  @type("number") roundNumber: number = 0;
  @type({ map: Moves }) moves = new MapSchema<Moves>(); // Keyed by moveNumber
  @type([PlayedCard]) winningCards = new ArraySchema<PlayedCard>();
  @type("string") roundWinner: string = "";
  @type("string") roundStatus: string = "pending";
}

// Player stores individual player data
export class Player extends Schema {
  @type("string") mongoId: string = "";
  @type("string") id: string = ""; 
  @type("string") username: string = "";
  @type(["string"]) hand = new ArraySchema<string>(); // Fixed
  @type("number") score: number = 0;
  @type(["string"]) bids = new ArraySchema<string>(); // store the card names
  @type("boolean") active: boolean = true; // whether the player is active in the game
  @type("boolean") eliminated: boolean = false;
  @type("boolean") connected: boolean = true;
  @type("number") rank: number = -1; 
}

// ChatMessage 
export class ChatMessage extends Schema {
  @type("string") sender: string = "";
  @type("string") content: string = "";
  @type("string") time: string = ""
}

// ChatRoom
export class ChatRoom extends Schema {
  @type([ChatMessage]) messages = new ArraySchema<ChatMessage>();
}

// GameState keeps track of the entire game
export class GameState extends Schema {
  // Add this to your room's state or as a private field
  @type("string") roomId: string = ""; // Unique identifier for the room
  @type("string") colyseusRoomId: string = "";
  @type("number") maxPlayers: number = 4; // Maximum number of players allowed in the room
  @type("number") maxPoints: number = 20; // Maximum points to win the game
  @type("string") creator: string = ""; // Creator of the room
  @type("string") roomName: string = ""; // Name of the game
  @type("string") roomType: string = ""; // Type of room (e.g. multiplayer, singleplayer)
  @type("boolean") bettingEnabled: boolean = false;
  @type("number") entryFee: number = 0;
  @type("number") prizePool: number = 0;
  @type("string") variant: string = ""; // Variant (e.g. Race, Survival)
  @type("number") eliminationCount: number = -1;
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
  @type(ChatRoom) chat = new ChatRoom()
}
