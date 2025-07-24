"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = exports.Payouts = exports.ChatRoom = exports.ChatMessage = exports.Player = exports.Round = exports.Moves = exports.PlayedCard = void 0;
const schema_1 = require("@colyseus/schema");
schema_1.Encoder.BUFFER_SIZE = 128 * 1024; // 128 KB
// PlayedCard represents a single card played in a move
class PlayedCard extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.playerName = "";
        this.cardName = "";
        this.rank = "";
        this.suit = "";
        this.value = 0;
        this.point = 0;
        this.bidIndex = 0;
    }
}
exports.PlayedCard = PlayedCard;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], PlayedCard.prototype, "playerName", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], PlayedCard.prototype, "cardName", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], PlayedCard.prototype, "rank", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], PlayedCard.prototype, "suit", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], PlayedCard.prototype, "value", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], PlayedCard.prototype, "point", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], PlayedCard.prototype, "bidIndex", void 0);
// Move represents a player's action in a round
class Moves extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.bids = new schema_1.ArraySchema();
        this.moveWinner = "";
    }
}
exports.Moves = Moves;
__decorate([
    (0, schema_1.type)([PlayedCard]),
    __metadata("design:type", Object)
], Moves.prototype, "bids", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Moves.prototype, "moveWinner", void 0);
class Round extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.roundNumber = 0;
        this.moves = new schema_1.MapSchema(); // Keyed by moveNumber
        this.winningCards = new schema_1.ArraySchema();
        this.roundWinner = "";
        this.roundStatus = "pending";
    }
}
exports.Round = Round;
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Round.prototype, "roundNumber", void 0);
__decorate([
    (0, schema_1.type)({ map: Moves }),
    __metadata("design:type", Object)
], Round.prototype, "moves", void 0);
__decorate([
    (0, schema_1.type)([PlayedCard]),
    __metadata("design:type", Object)
], Round.prototype, "winningCards", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Round.prototype, "roundWinner", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Round.prototype, "roundStatus", void 0);
// Player stores individual player data
class Player extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.mongoId = "";
        this.id = "";
        this.username = "";
        this.hand = new schema_1.ArraySchema(); // Fixed
        this.score = 0;
        this.bids = new schema_1.ArraySchema(); // store the card names
        this.active = true; // whether the player is active in the game
        this.eliminated = false;
        this.connected = true;
        this.rank = -1;
    }
}
exports.Player = Player;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Player.prototype, "mongoId", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Player.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Player.prototype, "username", void 0);
__decorate([
    (0, schema_1.type)(["string"]),
    __metadata("design:type", Object)
], Player.prototype, "hand", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Player.prototype, "score", void 0);
__decorate([
    (0, schema_1.type)(["string"]),
    __metadata("design:type", Object)
], Player.prototype, "bids", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "active", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "eliminated", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "connected", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Player.prototype, "rank", void 0);
// ChatMessage 
class ChatMessage extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.sender = "";
        this.content = "";
        this.time = "";
    }
}
exports.ChatMessage = ChatMessage;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], ChatMessage.prototype, "sender", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], ChatMessage.prototype, "content", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], ChatMessage.prototype, "time", void 0);
// ChatRoom
class ChatRoom extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.messages = new schema_1.ArraySchema();
    }
}
exports.ChatRoom = ChatRoom;
__decorate([
    (0, schema_1.type)([ChatMessage]),
    __metadata("design:type", Object)
], ChatRoom.prototype, "messages", void 0);
//Payouts
class Payouts extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.userId = "";
        this.amount = 0;
    }
}
exports.Payouts = Payouts;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Payouts.prototype, "userId", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Payouts.prototype, "amount", void 0);
// GameState keeps track of the entire game
class GameState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        // Add this to your room's state or as a private field
        this.roomId = ""; // Unique identifier for the room
        this.colyseusRoomId = "";
        this.maxPlayers = 4; // Maximum number of players allowed in the room
        this.maxPoints = 20; // Maximum points to win the game
        this.creator = ""; // Creator of the room
        this.roomName = ""; // Name of the game
        this.roomType = ""; // Type of room (e.g. multiplayer, singleplayer)
        this.bettingEnabled = false;
        this.entryFee = 0;
        this.prizePool = 0;
        this.variant = ""; // Variant (e.g. Race, Survival)
        this.eliminationCount = -1;
        this.playerUsernames = new schema_1.ArraySchema(); // List of players in the game
        this.deck = new schema_1.ArraySchema();
        this.players = new schema_1.MapSchema(); // Fixed
        this.rounds = new schema_1.ArraySchema(); // Fixed
        this.moveNumber = 0;
        this.nextPlayerIndex = 0; // Ensure you check for valid values in logic
        this.currentTurn = "";
        this.roundStatus = "pending";
        this.gameStatus = "pending";
        this.gameWinner = "";
        this.chat = new ChatRoom();
        this.payouts = new schema_1.ArraySchema();
    }
}
exports.GameState = GameState;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "roomId", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "colyseusRoomId", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "maxPlayers", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "maxPoints", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "creator", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "roomName", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "roomType", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], GameState.prototype, "bettingEnabled", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "entryFee", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "prizePool", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "variant", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "eliminationCount", void 0);
__decorate([
    (0, schema_1.type)(["string"]),
    __metadata("design:type", Object)
], GameState.prototype, "playerUsernames", void 0);
__decorate([
    (0, schema_1.type)(["string"]),
    __metadata("design:type", Object)
], GameState.prototype, "deck", void 0);
__decorate([
    (0, schema_1.type)({ map: Player }),
    __metadata("design:type", Object)
], GameState.prototype, "players", void 0);
__decorate([
    (0, schema_1.type)([Round]),
    __metadata("design:type", Object)
], GameState.prototype, "rounds", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "moveNumber", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "nextPlayerIndex", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "currentTurn", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "roundStatus", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "gameStatus", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "gameWinner", void 0);
__decorate([
    (0, schema_1.type)(ChatRoom),
    __metadata("design:type", Object)
], GameState.prototype, "chat", void 0);
__decorate([
    (0, schema_1.type)([Payouts]),
    __metadata("design:type", Object)
], GameState.prototype, "payouts", void 0);
