import { Room, Client, Delayed } from "colyseus";
import { ArraySchema, MapSchema } from "@colyseus/schema";
import { Encoder } from "@colyseus/schema";

import {
  GameState,
  Player,
  Round,
  PlayedCard,
  Moves,
  ChatRoom,
  ChatMessage,
} from "../../schemas/GameState";
import {
  createDeck,
  secureShuffleDeck,
  distributeCards,
  calculateMoveWinner,
  getCardRank,
  getCardSuit,
  getCardValue,
  getCardPoints,
} from "../../utils/roomUtils";
import { IBids } from "../../../types/game";
import { SurvivalModeStrategy } from "../strategy/SurvivalModeStrategy";
import { RaceModeStrategy } from "../strategy/RaceModeStrategy";
import { IGameModeStrategy } from "../strategy/IGameModeStrategy";

/* ───────────────────────────────────────────────── MULTIPLAYER ROOM ─────────────────────────────────────────────────── 
*
* This Colyseus room class handles both Race and Survival game modes, by injecting the game mode interfaces.
* It checks and validates turns and penalizes violators as well.
* Players who are eliminated or violators are kept in state as BANNED_USERS order for them to spectate.
* Price distribution, which is yet to be implemented, shall be done based on player ranks
* 
*/

export class MpGameRoom extends Room<GameState> {
  DECK = secureShuffleDeck(createDeck(), 10);
  max_clients = 4;
  MAX_MOVES = 5;
  PENALTY = -3;
  BASE_POINT!: number;
  MIN_POINTS = -9
  STRATEGY!: IGameModeStrategy;
  USER_TO_SESSION_MAP = new Map<string, string>();
  SECONDS_UNTIL_DISPOSE = 5000;
  VARIANT = "race";
  VIOLATORS = new Set<string>();
  ELIMINATED_PLAYERS = new Set<string>();
  ACTIVE_PLAYERS = new ArraySchema<Player>();
  TURN_TIMER: Delayed | null = null;

  /* ───────────────────────────────────────────────── UTILITY FUNCTIONS ─────────────────────────────────────────────────── */

  private dealCards(deck: string[]) {
    const legalPlayers = Array.from(this.state.players.values()).filter(p => p.active && !p.eliminated);

    const hands = distributeCards(
      legalPlayers.map(p => ({ playerName: p.username, hand: [] })),
      deck
    );

    for (const p of legalPlayers) {
      const h = hands.find(h => h.playerName === p.username);
      p.hand = new ArraySchema(...(h?.hand || []));
      p.bids = new ArraySchema();
    }
  }

  private getNextActivePlayerIndex(afterUsername: string): number {
    const total = this.state.playerUsernames.length;
    const startIndex = afterUsername
      ? this.state.playerUsernames.indexOf(afterUsername)
      : -1;

    for (let i = 1; i <= total; i++) {
      const nextIndex = (startIndex + i) % total;
      const username = this.state.playerUsernames[nextIndex];
      const player = [...this.state.players.values()].find(p => p.username === username);

      if (player && player.active && !player.eliminated && player.connected) {
        return nextIndex;
      }
    }

    return -1;
  }

  private getNextActivePlayerIndexFromStart(): number {
    return this.getNextActivePlayerIndex("");
  }

  private skipIfCurrentTurn(leaverUsername: string) {
    if (this.state.currentTurn === leaverUsername) {
      const nextIndex = this.getNextActivePlayerIndex(leaverUsername);
      
      if (nextIndex !== -1) {
        const nextUsername = this.state.playerUsernames[nextIndex];
        this.state.nextPlayerIndex = nextIndex;
        this.state.currentTurn = nextUsername;

        this.broadcast("notification", {
          message: `Turn skipped — ${leaverUsername} left. It's now ${nextUsername}'s turn.`,
        });

        this.broadcastGameState();

        // ADD: start timer for the new player
        const nextPlayer = [...this.state.players.values()]
          .find(p => p.username === nextUsername);

        if (nextPlayer) {
          this.startTurnTimer(nextPlayer);

          // ✅ auto-play if disconnected
          if (!nextPlayer.connected) {
            this.autoPlayForPlayer(nextPlayer);
          }
        }
      } else {
        this.endGame();
      }
    }
  }

  private assignNextMoveStarter(moveWinner: string) {
    const winner = [...this.state.players.values()].find(p =>
      p.username === moveWinner && p.active && !p.eliminated && p.connected
    );

    if (winner) {
      this.state.currentTurn = moveWinner;
      this.state.nextPlayerIndex = this.state.playerUsernames.indexOf(moveWinner);
    } else {
      const fallbackIndex = this.getNextActivePlayerIndex(moveWinner);
      if (fallbackIndex === -1) {
        this.endGame();
        return;
      }
      this.state.nextPlayerIndex = fallbackIndex;
      this.state.currentTurn = this.state.playerUsernames[fallbackIndex];
    }
  }

  private nextEliminationRank(): number {
    return ++this.state.eliminationCount;
  }

  private startTurnTimer(player: Player) {
    if (this.TURN_TIMER) {
      this.TURN_TIMER.clear();
    }

    const duration = 15; // seconds
    const deadline = Date.now() + duration * 1000;

    this.broadcast("start_turn_timer", {
      username: player.username,
      duration,
      deadline,
    });

    this.TURN_TIMER = this.clock.setTimeout(() => {
      this.autoPlayForPlayer(player);
    }, duration * 1000);
  }

  private autoPlayForPlayer(player: Player) {
    if (!player || !player.active || player.eliminated) return;
    if (this.state.currentTurn !== player.username) return;

    const round = this.state.rounds.at(-1);
    if (!round) return;

    const key = String(this.state.moveNumber);
    const move = round.moves.get(key);
    const firstSuit = move?.bids[0]?.suit;

    let cardToPlay = player.hand.find(c => !firstSuit || getCardSuit(c) === firstSuit)
                  || player.hand[0];

    if (!cardToPlay) return;

    this.handlePlayCard({ sessionId: player.id } as Client, { cardName: cardToPlay });
  }

  private broadcastGameState(){
    this.broadcast("update_state", { roomInfo: this.state  }, {afterNextPatch: true});
  }

  private handleSendMessagesInChat(
    client: Client,
    { sender, content, time }: { sender: string; content: string; time: string }
  ) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.connected || player.eliminated) return;

    const message = new ChatMessage();
    message.sender = sender;
    message.content = content;
    message.time = time;

    // Optional: keep chat history to last 50 messages
    if (this.state.chat.messages.length >= 50) {
      this.state.chat.messages.shift(); // remove oldest
    }

    this.state.chat.messages.push(message);

    this.broadcast("chat_message", message); // inform all clients
  }

  /* ───────────────────────────────────────────────── ROOM CREATION ─────────────────────────────────────────────────── */
  override onCreate(
    options: {roomId: string, coluserusRoomId: string; maxPlayers: number; maxPoints: number; creator: string, variant: string },
  ) {

    this.VARIANT = options.variant ?? "race";
    this.STRATEGY = this.VARIANT === "survival" ? new SurvivalModeStrategy() : new RaceModeStrategy();
    this.BASE_POINT = this.VARIANT === "survival" ? options.maxPoints : 0;
    this.MIN_POINTS = this.VARIANT === "survival" ? 0 : -9
    this.state = new GameState();
    this.state.deck = new ArraySchema(...this.DECK);
    this.state.roomId = options.roomId;
    this.state.colyseusRoomId = options.coluserusRoomId || this.roomId;
    this.state.maxPlayers = Number(options.maxPlayers);
    this.max_clients = this.state.maxPlayers;
    this.state.maxPoints = this.VARIANT === "survival" ? 0 : options.maxPoints;
    this.state.creator = options.creator;
    this.state.eliminationCount = -1
    this.state.chat = new ChatRoom();
    this.setMetadata(options);

    this.onMessage("play_card", this.handlePlayCard.bind(this));
    this.onMessage("chat_message", this.handleSendMessagesInChat.bind(this));
    this.onMessage("leave_room", this.onLeave);
  }

  /* ───────────────────────────────────────────────── JOINING ROOM ─────────────────────────────────────────────────── 
  * Starts game automatically when the room is full.
  */

  override onJoin(client: Client, { playerUsername }: { playerUsername: string }) {
    try {
      const existingSessionId = this.USER_TO_SESSION_MAP.get(playerUsername);

      if (this.VIOLATORS.has(playerUsername)) {
        client.error(4030, "You have been removed from this room for rule violations.");
        client.leave();
        return;
      }

      // Reconnecting
      if (existingSessionId) {
        const prev = this.state.players.get(existingSessionId);
        if (prev) {
          this.state.players.delete(existingSessionId);
          prev.id = client.sessionId;
          prev.connected = true;
          this.state.players.set(client.sessionId, prev);
          this.USER_TO_SESSION_MAP.set(playerUsername, client.sessionId);

          console.log(`Reconnected: ${playerUsername}`);
          this.broadcastGameState();
          return;
        }
      }

      // New player
      const newPlayer = new Player();
      newPlayer.id = client.sessionId;
      newPlayer.username = playerUsername;
      newPlayer.connected = true;
      newPlayer.active = true;
      newPlayer.eliminated = false;
      newPlayer.score = this.BASE_POINT;

      this.state.players.set(client.sessionId, newPlayer);
      this.USER_TO_SESSION_MAP.set(playerUsername, client.sessionId);

      if (!this.state.playerUsernames.includes(playerUsername)) {
        this.state.playerUsernames.push(playerUsername);
      }

      if (this.state.players.size >= this.state.maxPlayers) {
        this.state.gameStatus = "ready";
        this.startGame();
      }

      this.broadcastGameState();
    } catch (e) {
      console.error("[onJoin] fatal", e);
      client.error(2000, `${e}`);
    }
  }

  /* ───────────────────────────────────────────────── GAME FLOW ─────────────────────────────────────────────────── */

  startGame() {
    try {
      this.state.gameStatus = "started";
      
      const firstPlayerIndex = this.getNextActivePlayerIndexFromStart(); // "" → start from 0
      if (firstPlayerIndex === -1) {
        console.warn("[startGame] No eligible player to start");
        this.endGame();
        return;
      }

      this.state.nextPlayerIndex = firstPlayerIndex;
      this.state.roundStatus = "in_progress";

      this.startRound();
    } catch (e) {
      console.error("[startGame]", e);
    }
  }

  startRound() {
    try {
      const eligiblePlayers = [...this.state.players.values()].filter(
        p => p.active && !p.eliminated && p.connected
      );

      if (eligiblePlayers.length === 0) {
        console.warn("[startRound] No eligible players to start round");
        this.endGame();
        return;
      }

      const newDeck = secureShuffleDeck(createDeck(), 5);
      this.DECK = newDeck;

      const rnd = new Round();
      rnd.roundNumber = this.state.rounds.length;
      this.state.rounds.push(rnd);
      this.state.moveNumber = 0;

      this.dealCards(this.DECK);

      const nextUsername = this.state.playerUsernames[this.state.nextPlayerIndex];
      let nextPlayer = eligiblePlayers.find(p => p.username === nextUsername);

      if (!nextPlayer) {
        // Fallback: pick first available active player
        const fallbackIndex = this.getNextActivePlayerIndexFromStart();
        if (fallbackIndex === -1) {
          console.warn("[startRound] No valid player for turn");
          this.endGame();
          return;
        }

        this.state.nextPlayerIndex = fallbackIndex;
        this.state.currentTurn = this.state.playerUsernames[fallbackIndex];
        nextPlayer = eligiblePlayers.find(p => p.username === this.state.currentTurn);
      } else {
        this.state.currentTurn = nextUsername;
      }

      rnd.moves = new MapSchema<Moves>();
      rnd.winningCards = new ArraySchema<PlayedCard>();
      rnd.roundStatus = "in_progress";

      // ✅ Start timer for current player
      if (nextPlayer) {
        this.startTurnTimer(nextPlayer);

        // ✅ Immediately auto-play if the player is disconnected
        if (!nextPlayer.connected) {
          this.autoPlayForPlayer(nextPlayer);
        }
      }

      this.broadcastGameState();
    } catch (e) {
      console.error("[startRound]", e);
    }
  }

  handlePlayCard(client: Client, { cardName }: { cardName: string }) {
    try {
      const player = this.state.players.get(client.sessionId);
      if (!player || !player.active || player.eliminated || !player.connected) return;

      // Check it's their turn
      if (player.username !== this.state.currentTurn) return;

      const round = this.state.rounds.at(-1);
      if (!round) return;

      const key = String(this.state.moveNumber);
      if (!round.moves.has(key)) round.moves.set(key, new Moves());
      const move = round.moves.get(key)!;

      const newCard = new PlayedCard();
      newCard.playerName = player.username;
      newCard.cardName = cardName;
      newCard.rank = getCardRank(cardName);
      newCard.suit = getCardSuit(cardName);
      newCard.value = getCardValue(cardName);
      newCard.point = getCardPoints(cardName);
      newCard.bidIndex = move.bids.length;

      player.bids.push(newCard.cardName);
      move.bids.push(newCard);

      const idx = player.hand.indexOf(cardName);
      if (idx !== -1) player.hand.splice(idx, 1);

      // Penalty Check
      if (move.bids.length > 1) {
        const firstSuit = move.bids[0].suit;
        const currentSuit = newCard.suit;
        const hasSuit = player.hand.some(card => getCardSuit(card) === firstSuit);

        if (currentSuit !== firstSuit && hasSuit) {
          const penaltyApplied = this.STRATEGY.applyPenalty(player, {
            minPoints: this.MIN_POINTS,
            nextEliminationRank: () => this.nextEliminationRank(),
            bannedUsers: this.VIOLATORS,
            eliminatedPlayers: this.ELIMINATED_PLAYERS,
          });

          if (penaltyApplied) {
            this.broadcast("notification", {
              message: `${player.username} was removed for repeated violations.`,
            });
            this.broadcastGameState();

            const activePlayers = [...this.state.players.values()]
              .filter(p => p.active && p.connected && !p.eliminated);

            if (activePlayers.length === 1) {
              const last = activePlayers[0];
              last.score = this.state.maxPoints;
              this.state.gameWinner = last.username;
              this.state.gameStatus = "complete";

              this.broadcast("notification", {
                message: `${last.username} wins by default.`,
              });

              this.broadcastGameState();
              this.clock.setTimeout(() => this.disconnect(), 3000);
            }

            return;
          }

          this.broadcast("notification", {
            message: `${player.username} played the wrong suit and lost 3 points.`,
          });

          this.broadcastGameState();

          const nextIndex = this.getNextActivePlayerIndex(player.username);
          if (nextIndex === -1) {
            this.endGame();
            return;
          }

          const nextPlayer = [...this.state.players.values()].find(
            p => p.username === this.state.playerUsernames[nextIndex]
          );
          if (!nextPlayer) return;

          this.state.nextPlayerIndex = nextIndex;
          this.state.currentTurn = nextPlayer.username;

          this.clock.setTimeout(() => {
            this.startRound();
          }, 2000);

          return;
        }
      }

      // ✅ Check if move complete
      const legalPlayerCount = [...this.state.players.values()]
        .filter(p => p.active && !p.eliminated).length;

      if (move.bids.length >= legalPlayerCount) {
        // stop turn timer before evaluating
        if (this.TURN_TIMER) {
          this.clock.clear();
          this.TURN_TIMER = null;
        }
        this.evaluateMove();
      } else {
        const nextIndex = this.getNextActivePlayerIndex(player.username);
        if (nextIndex === -1) {
          this.endGame();
          return;
        }

        const nextPlayer = [...this.state.players.values()]
          .find(p => p.username === this.state.playerUsernames[nextIndex]);
        if (!nextPlayer) return;

        this.state.nextPlayerIndex = nextIndex;
        this.state.currentTurn = nextPlayer.username;

        if (this.TURN_TIMER) {
          this.TURN_TIMER.clear();
          this.TURN_TIMER = null;
        }

        this.startTurnTimer(nextPlayer);

        // ✅ Auto-play immediately if disconnected
        if (!nextPlayer.connected) {
          this.autoPlayForPlayer(nextPlayer);
        }
      }

      this.broadcastGameState();
    } catch (e) {
      console.error("[handlePlayCard]", e);
      client.error(4000, `${e}`);
    }
  }

  evaluateMove() {
    try {
      const round = this.state.rounds.at(-1);
      if (!round) return;

      const key = String(this.state.moveNumber);
      const move = round.moves.get(key);

      const expectedMoveCount = [...this.state.players.values()]
        .filter(p => p.active && !p.eliminated).length;

      if (!move || move.bids.length < expectedMoveCount) return;

      const { winningCard, moveWinner } = calculateMoveWinner(
        move.bids as unknown as IBids[]
      )!;

      move.moveWinner = moveWinner;
      const win = new PlayedCard();
      Object.assign(win, winningCard);
      round.winningCards.push(win);
      this.state.moveNumber++;

      if (this.state.moveNumber < this.MAX_MOVES) {
        this.assignNextMoveStarter(moveWinner);

        // ✅ ADD THIS BLOCK
        const currentPlayer = [...this.state.players.values()]
          .find(p => p.username === this.state.currentTurn);

        if (currentPlayer) {
          this.startTurnTimer(currentPlayer);

          if (!currentPlayer.connected) {
            this.autoPlayForPlayer(currentPlayer);
          }
        }
        // ✅ END BLOCK

      } else {
        round.roundWinner = moveWinner;
        this.STRATEGY.awardPoints(round, this.state.players);
        round.roundStatus = "complete";

        if (this.checkGameOver()) {
          this.endGame();
          return;
        }

        this.clock.setTimeout(() => {
          this.startNextRound(moveWinner);
        }, 1500);
      }

      this.broadcastGameState();
    } catch (e) {
      console.error("[evaluateMove]", e);
    }
  }

  startNextRound(roundWinner: string) {
    try {

      const nextIndex = this.getNextActivePlayerIndex(roundWinner);
      if (nextIndex === -1) {
        this.endGame();
        return;
      }
      this.state.nextPlayerIndex = nextIndex;

      this.startRound();
    } catch (e) {
      console.error("[startNextRound]", e);
    }
  }

  checkGameOver(): boolean {
    if (this.VARIANT === "survival") {
      const alivePlayers = [...this.state.players.values()].filter(
        p => p.active && !p.eliminated && p.connected && p.score > this.MIN_POINTS
      );

      if (alivePlayers.length === 1) {
        const lastStanding = alivePlayers[0];
        this.state.gameWinner = lastStanding.username;
        this.state.gameStatus = "complete";
        return true;
      }

      return false;
    }

    // Default Race Game logic
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
        this.disconnect(4000)
      }, (this.SECONDS_UNTIL_DISPOSE))

    } catch (e) {
      console.error("[endGame]", e);
    }
  }

  /* ───────────────────────────────────── DISCONNECTIONS AND VOLUNTARY LEAVES ──────────────────────────────────────────── */
  override async onLeave(client: Client, consented: boolean) {
    try {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const leaverSessionId = client.sessionId;
      const leaverUsername = player.username;

      if (consented) {
        player.active = false;
        player.eliminated = true;
        player.rank = this.nextEliminationRank();
        player.hand.clear();
        player.bids.clear();
        this.ELIMINATED_PLAYERS.add(leaverUsername);

        this.broadcast("notification", {
          message: `${leaverUsername} left the room and has been eliminated.`,
        });

        // ✅ Skip turn if it was their turn
        this.skipIfCurrentTurn(leaverUsername);

        this.broadcastGameState();

        const remaining = [...this.state.players.values()].filter(p => p.active);
        if (remaining.length === 1) {
          const winner = remaining[0];
          winner.score = this.state.maxPoints;
          this.state.gameWinner = winner.username;
          this.state.gameStatus = "complete";

          this.broadcast("notification", {
            message: `${winner.username} wins by default.`,
          });
          this.broadcastGameState();

          this.clock.setTimeout(() => this.disconnect(), 900);
        }

        return;
      }

      // Not consented → disconnected
      player.connected = false;

      // Allow reconnection (non-blocking)
      this.allowReconnection(client, 30).catch(() => {});

      // Schedule fallback if not reconnected in time
      this.clock.setTimeout(() => {
        const stillOffline = this.state.players.get(leaverSessionId)?.connected === false;
        if (!stillOffline) return;

        const p = this.state.players.get(leaverSessionId);
        if (p) {
          p.active = false;
          p.eliminated = true;
          p.rank = this.nextEliminationRank();
          p.hand.clear();
          p.bids.clear();
          this.ELIMINATED_PLAYERS.add(leaverUsername);
        }

        this.skipIfCurrentTurn(leaverUsername);

        const currentPlayer = [...this.state.players.values()]
          .find(p => p.username === this.state.currentTurn);

        if (currentPlayer) {
          this.startTurnTimer(currentPlayer);
          if (!currentPlayer.connected) {
            this.autoPlayForPlayer(currentPlayer);
          }
        }

        this.USER_TO_SESSION_MAP.delete(leaverUsername);

        this.broadcast("notification", {
          message: `${leaverUsername} was eliminated after disconnect timeout.`,
        });

        this.broadcastGameState();

        const connected = [...this.state.players.values()].filter(p => p.connected);
        if (connected.length === 0) {
          console.log(`[Room] No connected players remaining, disposing room ${this.roomId}`);
          this.disconnect();
        }
      }, 60 * 1000);
    } catch (e) {
      console.error("[onLeave]", e);
    }
  }
}
