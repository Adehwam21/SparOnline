"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceGameRoom = void 0;
const colyseus_1 = require("colyseus");
const schema_1 = require("@colyseus/schema");
const GameState_1 = require("../../schemas/GameState");
const roomUtils_1 = require("../../utils/roomUtils");
class RaceGameRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.DECK = (0, roomUtils_1.secureShuffleDeck)((0, roomUtils_1.createDeck)(), 10);
        this.maxClients = 4;
        this.MAX_MOVES = 5;
        this.MIN_POINTS = -15;
        this.USER_TO_SESSION_MAP = new Map();
        this.BANNED_USERS = new Set();
        this.SECONDS_UNTIL_DISPOSE = 10 * 1000;
    }
    onCreate(options) {
        this.state = new GameState_1.GameState();
        this.state.deck = new schema_1.ArraySchema(...this.DECK);
        this.state.roomId = options.roomId || this.roomId;
        this.state.maxPlayers = Number(options.maxPlayers);
        this.maxClients = this.state.maxPlayers + 1;
        this.state.maxPoints = Number(options.maxPoints);
        this.state.creator = options.creator;
        this.setMetadata(options);
        this.onMessage("play_card", this.handlePlayCard.bind(this));
        this.onMessage("leave_room", this.onLeave);
    }
    onJoin(client, { playerUsername }) {
        try { // ⚠️ reconnect / new‑join can throw if Map ops fail
            const existing = this.USER_TO_SESSION_MAP.get(playerUsername);
            if (this.BANNED_USERS.has(playerUsername)) {
                console.warn(`[onJoin] Rejected banned player: ${playerUsername}`);
                client.error(4030, "You have been removed from this room for rule violations.");
                client.leave();
                return;
            }
            if (existing) {
                const prev = this.state.players.get(existing);
                if (prev) {
                    this.state.players.delete(existing);
                    prev.id = client.sessionId;
                    prev.active = true;
                    this.state.players.set(client.sessionId, prev);
                    this.USER_TO_SESSION_MAP.set(playerUsername, client.sessionId);
                    console.log(`Reconnected: ${playerUsername}`);
                    this.broadcastGameState();
                    return;
                }
            }
            /* new player */
            const p = new GameState_1.Player();
            p.id = client.sessionId;
            p.username = playerUsername;
            p.active = true;
            p.connected = true;
            p.score = 0;
            if (!this.state.playerUsernames.includes(playerUsername)) {
                this.state.playerUsernames.push(playerUsername);
            }
            this.state.players.set(client.sessionId, p);
            this.USER_TO_SESSION_MAP.set(playerUsername, client.sessionId);
            console.log(`[onJoin]: ${playerUsername} joined`);
            if (this.state.players.size >= this.state.maxPlayers) {
                this.state.gameStatus = "ready";
                this.startGame();
            }
            this.broadcastGameState();
        }
        catch (e) {
            console.error("[onJoin] Error:", e);
            client.error(2000, `${e}`);
        }
    }
    broadcastGameState() {
        this.broadcast("update_state", { roomInfo: this.state }, { afterNextPatch: true });
    }
    /* ───────────────────────────  GAME FLOW ───────────────────────────  */
    dealCards(deck) {
        const playersArr = Array.from(this.state.players.values());
        const hands = (0, roomUtils_1.distributeCards)(playersArr.map(p => ({ playerName: p.username, hand: [] })), deck);
        for (const p of playersArr) {
            const h = hands.find(h => h.playerName === p.username);
            p.hand = new schema_1.ArraySchema(...((h === null || h === void 0 ? void 0 : h.hand) || []));
            p.bids = new schema_1.ArraySchema();
        }
    }
    startGame() {
        try {
            this.state.gameStatus = "started";
            this.state.nextPlayerIndex = 0; // the creator of the room becomes the first to bid
            this.state.roundStatus = "in_progress";
            this.startRound();
        }
        catch (e) {
            console.error("[startGame]", e);
        }
    }
    startRound() {
        try {
            const newDeck = (0, roomUtils_1.secureShuffleDeck)((0, roomUtils_1.createDeck)(), 5);
            this.DECK = newDeck;
            const rnd = new GameState_1.Round();
            rnd.roundNumber = this.state.rounds.length;
            this.state.rounds.push(rnd);
            this.state.moveNumber = 0;
            /* deal */
            this.dealCards(this.DECK);
            this.state.currentTurn =
                this.state.playerUsernames[this.state.nextPlayerIndex];
            rnd.moves = new schema_1.MapSchema();
            rnd.winningCards = new schema_1.ArraySchema();
            rnd.roundStatus = "in_progress";
            this.broadcastGameState();
        }
        catch (e) {
            console.error("[startRound]", e);
        }
    }
    handlePlayCard(client, { cardName }) {
        try {
            const player = this.state.players.get(client.sessionId);
            if (!player || player.username !== this.state.currentTurn)
                return;
            const round = this.state.rounds.at(-1);
            if (!round)
                return;
            const key = String(this.state.moveNumber);
            if (!round.moves.has(key))
                round.moves.set(key, new GameState_1.Moves());
            const move = round.moves.get(key);
            const newCard = new GameState_1.PlayedCard();
            newCard.playerName = player.username;
            newCard.cardName = cardName;
            newCard.rank = (0, roomUtils_1.getCardRank)(cardName);
            newCard.suit = (0, roomUtils_1.getCardSuit)(cardName);
            newCard.value = (0, roomUtils_1.getCardValue)(cardName);
            newCard.point = (0, roomUtils_1.getCardPoints)(cardName);
            newCard.bidIndex = move.bids.length;
            // Add card to player and move
            player.bids.push(newCard.cardName);
            move.bids.push(newCard);
            // Remove card from hand
            const idx = player.hand.indexOf(cardName);
            if (idx !== -1)
                player.hand.splice(idx, 1);
            // Check for violation and penalize
            if (move.bids.length > 1) {
                const firstSuit = move.bids[0].suit;
                const currentSuit = newCard.suit;
                // Check if player has any card of the same suit
                const haveSomeCardOfSuit = player.hand.some(card => (0, roomUtils_1.getCardSuit)(card) === firstSuit);
                const isSuitMismatch = currentSuit !== firstSuit;
                // Check for violations an penalize
                if (isSuitMismatch && haveSomeCardOfSuit) {
                    player.score -= 3;
                    // Bar player from room forever. If they get a lowwer score
                    if (player.score <= this.MIN_POINTS) {
                        this.state.players.delete(client.sessionId);
                        this.USER_TO_SESSION_MAP.delete(player.username);
                        this.BANNED_USERS.add(player.username);
                        this.broadcast("notification", {
                            message: `${player.username} was removed for repeated violations (score too low).`,
                        });
                        this.broadcastGameState();
                        /*
                        * Force end the game if only one active player remains in the room
                        * The last player becomes the winner by default
                        */
                        const activePlayersOnline = [...this.state.players.values()].filter(p => p.connected && p.active);
                        if (activePlayersOnline.length === 1) {
                            const lastPlayer = activePlayersOnline[0];
                            lastPlayer.score = this.state.maxPoints;
                            this.state.gameWinner = lastPlayer.username;
                            this.state.gameStatus = "complete";
                            this.broadcast("notification", {
                                message: `${lastPlayer.username} wins by default as all others were removed.`,
                            });
                            this.broadcastGameState();
                            this.clock.setTimeout(() => this.disconnect(), 3000);
                        }
                        return;
                    }
                    this.broadcast("notification", {
                        message: `${player.username} played a different suit and lost 3 points!`,
                    });
                    this.broadcastGameState();
                    const currentIndex = this.state.playerUsernames.indexOf(player.username);
                    const nextIndex = (currentIndex + 1) % this.state.playerUsernames.length;
                    this.state.nextPlayerIndex = nextIndex;
                    this.state.currentTurn = this.state.playerUsernames[nextIndex];
                    this.clock.setTimeout(() => {
                        this.startRound();
                        this.broadcastGameState();
                    }, 2000);
                    return;
                }
            }
            /*
            * Proceed to next turn or evaluate valid move if move has ended
            * A valid move is one where all cards follow the leaiding card and there are no violationa either
            */
            if (move.bids.length === this.state.players.size) {
                this.evaluateMove();
            }
            else {
                this.state.nextPlayerIndex =
                    (this.state.nextPlayerIndex + 1) % this.state.players.size;
                this.state.currentTurn =
                    this.state.playerUsernames[this.state.nextPlayerIndex];
            }
            this.broadcastGameState();
        }
        catch (e) {
            console.error("[handlePlayCard]", e);
            client.error(4000, `${e}`);
        }
    }
    evaluateMove() {
        try {
            const round = this.state.rounds.at(-1);
            if (!round)
                return;
            const key = String(this.state.moveNumber);
            const move = round.moves.get(key);
            if (!move || move.bids.length < this.state.players.size)
                return;
            const { winningCard, moveWinner } = (0, roomUtils_1.calculateMoveWinner)(move.bids);
            move.moveWinner = moveWinner;
            const win = new GameState_1.PlayedCard();
            Object.assign(win, winningCard);
            round.winningCards.push(win);
            this.state.moveNumber++;
            // round in progress
            if (this.state.moveNumber < this.MAX_MOVES) {
                this.state.nextPlayerIndex =
                    this.state.playerUsernames.indexOf(moveWinner);
                this.state.currentTurn = moveWinner;
            }
            else {
                // round finished
                round.roundWinner = moveWinner;
                const sess = this.USER_TO_SESSION_MAP.get(moveWinner);
                if (sess) {
                    const p = this.state.players.get(sess);
                    p.score += (0, roomUtils_1.calculateRoundPoints)(round.winningCards);
                }
                round.roundStatus = "complete";
                if (this.checkGameOver()) {
                    this.endGame();
                    return;
                }
                this.clock.setTimeout(() => {
                    this.startNextRound(moveWinner);
                }, 1200);
            }
            this.broadcastGameState();
        }
        catch (e) {
            console.error("[evaluateMove]", e);
        }
    }
    advanceTurn(winnerName) {
        const i = this.state.playerUsernames.indexOf(winnerName);
        return i === -1 ? this.state.nextPlayerIndex : (i + 1) % this.state.playerUsernames.length;
    }
    startNextRound(roundWinner) {
        try {
            this.state.nextPlayerIndex = this.advanceTurn(roundWinner);
            this.startRound();
        }
        catch (e) {
            console.error("[startNextRound]", e);
        }
    }
    checkGameOver() {
        for (const p of this.state.players.values()) {
            if (p.score >= this.state.maxPoints) {
                this.state.gameWinner = p.username;
                this.state.gameStatus = "complete";
                return true;
            }
        }
        return false;
    }
    endGame() {
        try {
            this.broadcastGameState();
            // Dispose the room after 10 seconds
            this.clock.setTimeout(() => {
                this.disconnect(4000);
            }, (this.SECONDS_UNTIL_DISPOSE));
        }
        catch (e) {
            console.error("[endGame]", e);
        }
    }
    onLeave(client, consented) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const player = this.state.players.get(client.sessionId);
                if (!player)
                    return;
                const leaver = player.username;
                // Handle consented leave
                if (consented) {
                    this.state.players.delete(client.sessionId);
                    this.USER_TO_SESSION_MAP.delete(leaver);
                    this.broadcast("notification", {
                        message: `${leaver} has left the room`,
                    });
                    this.broadcastGameState();
                    console.log(`[Event] onLeave: ${leaver} has left with consent`);
                    // ✅ Check for only one active player left
                    const activePlayers = [...this.state.players.values()].filter(p => p.active);
                    if (activePlayers.length === 1) {
                        const lastPlayer = activePlayers[0];
                        lastPlayer.score = this.state.maxPoints; // Give them max score to end game
                        this.state.gameWinner = lastPlayer.username;
                        this.state.gameStatus = "complete";
                        this.broadcast("notification", {
                            message: `${lastPlayer.username} wins by default.`,
                        });
                        this.broadcastGameState();
                        // Dispose room after a short delay to ensure state is delivered
                        this.clock.setTimeout(() => {
                            console.log(`[Room] Auto-disposing room ${this.roomId} — last player remaining`);
                            this.disconnect();
                        }, 3000); // wait 3 seconds
                    }
                    return;
                }
                player.active = false;
                // Wait 60s for reconnection
                yield this.allowReconnection(client, 60);
                // If player reconnects in time, do nothing (reconnection handled in `onJoin`)
                // But if they don’t:
                this.clock.setTimeout(() => {
                    var _a;
                    const stillInactive = ((_a = this.state.players.get(client.sessionId)) === null || _a === void 0 ? void 0 : _a.active) === false;
                    if (stillInactive) {
                        this.state.players.delete(client.sessionId);
                        this.USER_TO_SESSION_MAP.delete(leaver);
                        this.broadcast("notification", {
                            message: `${leaver} was removed after disconnect timeout.`,
                        });
                        this.broadcastGameState();
                        console.log(`[Event] ${leaver} removed due to inactivity`);
                        // ✅ Auto-dispose room if no active players remain
                        const activePlayers = [...this.state.players.values()].filter(p => p.active);
                        if (activePlayers.length === 0) {
                            console.log(`[Room] No active players remaining, disposing room ${this.roomId}`);
                            this.disconnect();
                        }
                    }
                }, 60 * 1000);
            }
            catch (e) {
                console.error("[onLeave]", e);
            }
        });
    }
}
exports.RaceGameRoom = RaceGameRoom;
