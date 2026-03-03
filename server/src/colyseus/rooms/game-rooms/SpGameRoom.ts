import { Room, Client } from "colyseus";
import { ArraySchema, MapSchema } from "@colyseus/schema";
import {
  GameState,
  Player,
  Round,
  PlayedCard,
  Moves,
} from "../../schemas/GameState";
import {
  createDeck,
  secureShuffleDeck,
  calculateRoundPoints,
  distributeCards,
  calculateMoveWinner,
  getCardSuit,
  makeCard,
} from "../../utils/roomUtils";
import { IBids } from "../../../types/game";
import { SparBot } from "../../bots/SparBot";
import { Difficulty } from "../../bots/Bot";

export class SpGameRoom extends Room<GameState> {
  DECK = secureShuffleDeck(createDeck(), 10);
  MAX_CLIENTS = 4;
  MAX_MOVES = 5;
  MIN_POINTS = -6;
  USER_TO_SESSION_MAP = new Map<string, string>();
  BOT: SparBot | any;
  BANNED_USERS = new Set<string>();
  SECONDS_UNTIL_DISPOSE = 10 * 1000;

  // How long the bot "thinks" before playing (ms)
  BOT_THINK_TIME = 1000;

  override onCreate(
    options: {
      roomId: string;
      maxPlayers: number;
      maxPoints: number;
      creator: string;
      botDifficulty: string;
    },
  ) {
    this.state = new GameState();
    this.state.deck = new ArraySchema(...this.DECK);
    this.state.roomId = options.roomId || this.roomId;
    this.state.maxPlayers = Number(options.maxPlayers);
    this.MAX_CLIENTS = this.state.maxPlayers + 1;
    this.state.maxPoints = Number(options.maxPoints);
    this.state.creator = options.creator;
    this.BOT = new SparBot(options.botDifficulty as Difficulty);
    this.setMetadata(options);

    this.onMessage("play_card", this.handlePlayCard.bind(this));
    this.onMessage("leave_room", this.onLeave);
  }

  override onJoin(
    client: Client,
    { playerUsername }: { playerUsername: string },
  ) {
    try {
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

      // New player
      const p = new Player();
      p.id = client.sessionId;
      p.username = playerUsername;
      p.active = true;

      // Bot player entry (always keyed by "bot")
      const b = new Player();
      b.id = "bot";
      b.username = "bot";
      b.active = true;

      if (!this.state.playerUsernames.includes(playerUsername)) {
        this.state.playerUsernames.push(playerUsername);
      }

      this.state.players.set(client.sessionId, p);
      this.state.players.set("bot", b);
      this.USER_TO_SESSION_MAP.set(playerUsername, client.sessionId);
      console.log(`Joined: ${playerUsername}`);

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

  private broadcastGameState() {
    this.broadcast(
      "update_state",
      { roomInfo: this.state },
      { afterNextPatch: true },
    );
  }

  /* ─────────────────────────────────────────────────────────────
     GAME FLOW
  ───────────────────────────────────────────────────────────── */

  private dealCards(deck: string[]) {
    const playersArr = Array.from(this.state.players.values());

    const hands = distributeCards(
      playersArr.map((p) => ({ playerName: p.username, hand: [] })),
      deck,
    );

    for (const p of playersArr) {
      const h = hands.find((h) => h.playerName === p.username);
      p.hand = new ArraySchema(...(h?.hand || []));
      p.bids = new ArraySchema();
    }
  }

  startGame() {
    try {
      this.state.gameStatus = "started";
      this.state.nextPlayerIndex = 0;
      this.state.roundStatus = "in_progress";
      this.startRound();
    } catch (e) {
      console.error("[startGame]", e);
    }
  }

  startRound() {
    try {
      const newDeck = secureShuffleDeck(createDeck(), 5);
      this.DECK = newDeck;

      const rnd = new Round();
      rnd.roundNumber = this.state.rounds.length;
      this.state.rounds.push(rnd);
      this.state.moveNumber = 0;

      this.dealCards(this.DECK);

      this.state.currentTurn =
        this.state.playerUsernames[this.state.nextPlayerIndex];

      rnd.moves = new MapSchema<Moves>();
      rnd.winningCards = new ArraySchema<PlayedCard>();
      rnd.roundStatus = "in_progress";

      this.broadcastGameState();

      // If the bot leads this round, trigger its turn immediately
      this.maybeTriggerBot();
    } catch (e) {
      console.error("[startRound]", e);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     BOT TURN MANAGEMENT

     maybeTriggerBot() is the single place we decide whether
     it's the bot's turn. Call it anywhere currentTurn may have
     just changed: after startRound, after handlePlayCard advances
     the turn, and after evaluateMove sets the next leader.

     The bot plays after BOT_THINK_TIME ms to simulate thinking.
  ───────────────────────────────────────────────────────────── */

  private maybeTriggerBot() {
    if (this.state.currentTurn !== "bot") return;
    if (this.state.gameStatus === "complete") return;

    this.clock.setTimeout(() => {
      // Guard again inside the timeout — state may have changed
      if (this.state.currentTurn !== "bot") return;
      if (this.state.gameStatus === "complete") return;

      this.botPlayTurn();
    }, this.BOT_THINK_TIME);
  }

  /**
   * Ask the bot to choose a card and inject it into the game
   * exactly as if a human client had sent a "play_card" message.
   *
   * We pass a plain JS snapshot of the game state so the bot
   * receives the same shape it was designed to read (rounds array,
   * players map, moveNumber, etc.) without Colyseus schema wrappers.
   */
  private async botPlayTurn() {
    try {
      const stateSnapshot = this.buildBotGameState();
      const response      = await this.BOT.playMove(stateSnapshot);

      if (!response?.cardName) {
        console.error("[botPlayTurn] Bot returned no card");
        return;
      }

      this.applyBotCard(response.cardName);
    } catch (e) {
      console.error("[botPlayTurn]", e);
    }
  }

  /**
   * Build a plain-object snapshot of the game state for the bot.
   *
   * The bot reads:
   *   - gameState.players["bot"].hand
   *   - gameState.players[opponentId].score
   *   - gameState.rounds (array of rounds with moves/bids)
   *   - gameState.moveNumber
   *   - gameState.maxPoints       ← passed through for adaptive scoring
   */
  private buildBotGameState(): any {
    const playersSnapshot: Record<string, any> = {};

    for (const [key, p] of this.state.players.entries()) {
      playersSnapshot[key === "bot" ? "bot" : key] = {
        id:       p.id,
        username: p.username,
        hand:     [...p.hand],
        score:    p.score,
      };
    }

    // Also expose by username "bot" so the bot's own lookup always works
    // (in case the key is a sessionId for the human but "bot" for the bot)
    const botEntry = this.state.players.get("bot");
    if (botEntry) {
      playersSnapshot["bot"] = {
        id:       botEntry.id,
        username: botEntry.username,
        hand:     [...botEntry.hand],
        score:    botEntry.score,
      };
    }

    // Serialise rounds → plain objects
    const roundsSnapshot = this.state.rounds.map((rnd) => {
      const movesSnapshot: Record<string, any> = {};

      rnd.moves.forEach((move, key) => {
        movesSnapshot[key] = {
          bids: move.bids.map((b) => ({
            playerName: b.playerName,
            cardName:   b.cardName,
            rank:       b.rank,
            suit:       b.suit,
            value:      b.value,
            point:      b.point,
            bidIndex:   b.bidIndex,
          })),
          moveWinner: move.moveWinner,
        };
      });

      return {
        roundNumber:  rnd.roundNumber,
        moves:        movesSnapshot,
        winningCards: rnd.winningCards.map((c) => ({ ...c })),
        roundWinner:  rnd.roundWinner,
        roundStatus:  rnd.roundStatus,
      };
    });

    return {
      players:    playersSnapshot,
      rounds:     roundsSnapshot,
      moveNumber: this.state.moveNumber,
      maxPoints:  this.state.maxPoints,   // bot needs this for adaptive scoring
      currentTurn: this.state.currentTurn,
    };
  }

  /**
   * Apply the bot's chosen card into the game state.
   * Mirrors handlePlayCard exactly — penalty check, hand removal,
   * move evaluation — but uses the bot's player entry directly
   * instead of resolving a client session.
   */
  private applyBotCard(cardName: string) {
    try {
      const botPlayer = this.state.players.get("bot");
      if (!botPlayer) return;

      // Confirm it's still the bot's turn (race-condition guard)
      if (this.state.currentTurn !== "bot") return;

      const round = this.state.rounds.at(-1);
      if (!round) return;

      const key = String(this.state.moveNumber);
      if (!round.moves.has(key)) round.moves.set(key, new Moves());
      const move = round.moves.get(key)!;

      const bidIndex = move.bids.length;
      const newCard  = new PlayedCard();
      Object.assign(newCard, makeCard(botPlayer.username, cardName, bidIndex));

      botPlayer.bids.push(newCard.cardName);
      move.bids.push(newCard);

      // Remove card from bot's hand
      const idx = botPlayer.hand.indexOf(cardName);
      if (idx !== -1) botPlayer.hand.splice(idx, 1);

      /*
        NOTE: The bot's SparBot logic already avoids suit violations.
        The penalty check below is a safety net in case something
        unexpected happens (e.g. bot hand is stale, edge case in logic).
      */
      if (move.bids.length > 1) {
        const firstSuit   = move.bids[0].suit;
        const currentSuit = newCard.suit;
        const haveSuit    = botPlayer.hand.some(
          (c) => getCardSuit(c) === firstSuit,
        );

        if (currentSuit !== firstSuit && haveSuit) {
          botPlayer.score -= 3;
          this.broadcast("notification", {
            message: `Bot played a different suit and lost 3 points!`,
          });
        }
      }

      // Either evaluate the move (all players played) or advance turn
      if (move.bids.length === this.state.players.size) {
        this.evaluateMove();
      } else {
        this.state.nextPlayerIndex =
          (this.state.nextPlayerIndex + 1) % this.state.players.size;
        this.state.currentTurn =
          this.state.playerUsernames[this.state.nextPlayerIndex];

        // In case the next player is also the bot (future: >2 players)
        this.maybeTriggerBot();
      }

      this.broadcastGameState();
    } catch (e) {
      console.error("[applyBotCard]", e);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     HUMAN CARD PLAY
  ───────────────────────────────────────────────────────────── */

  handlePlayCard(client: Client, { cardName }: { cardName: string }) {
    try {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.username !== this.state.currentTurn) return;

      const round = this.state.rounds.at(-1);
      if (!round) return;

      const key = String(this.state.moveNumber);
      if (!round.moves.has(key)) round.moves.set(key, new Moves());
      const move = round.moves.get(key)!;

      const bidIndex = move.bids.length;
      const newCard  = new PlayedCard();
      Object.assign(newCard, makeCard(player.username, cardName, bidIndex));

      player.bids.push(newCard.cardName);
      move.bids.push(newCard);

      // Remove card from hand
      const idx = player.hand.indexOf(cardName);
      if (idx !== -1) player.hand.splice(idx, 1);

      // Penalty check
      if (move.bids.length > 1) {
        const firstSuit        = move.bids[0].suit;
        const currentSuit      = newCard.suit;
        const haveSomeCardOfSuit = player.hand.some(
          (c) => getCardSuit(c) === firstSuit,
        );

        if (currentSuit !== firstSuit && haveSomeCardOfSuit) {
          player.score -= 3;

          // Ban and remove if score too low
          if (player.score <= this.MIN_POINTS) {
            this.BANNED_USERS.add(player.username);
            this.state.players.delete(client.sessionId);
            this.USER_TO_SESSION_MAP.delete(player.username);

            this.broadcast("notification", {
              message: `${player.username} was removed for repeated violations.`,
            });

            this.broadcastGameState();

            const activePlayers = [...this.state.players.values()].filter(
              (p) => p.active,
            );
            if (activePlayers.length === 1) {
              const lastPlayer = activePlayers[0];
              lastPlayer.score       = this.state.maxPoints;
              this.state.gameWinner  = lastPlayer.username;
              this.state.gameStatus  = "complete";
              this.broadcast("notification", {
                message: `${lastPlayer.username} wins by default.`,
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
          const nextIndex    = (currentIndex + 1) % this.state.playerUsernames.length;
          this.state.nextPlayerIndex = nextIndex;
          this.state.currentTurn     = this.state.playerUsernames[nextIndex];

          this.clock.setTimeout(() => {
            this.startRound();
            this.broadcastGameState();
          }, 2000);

          return;
        }
      }

      // Advance turn or evaluate
      if (move.bids.length === this.state.players.size) {
        this.evaluateMove();
      } else {
        this.state.nextPlayerIndex =
          (this.state.nextPlayerIndex + 1) % this.state.players.size;
        this.state.currentTurn =
          this.state.playerUsernames[this.state.nextPlayerIndex];

        // Human played — check if it's now the bot's turn
        this.maybeTriggerBot();
      }

      this.broadcastGameState();
    } catch (e) {
      console.error("[handlePlayCard]", e);
      client.error(4000, `${e}`);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     MOVE / ROUND EVALUATION
  ───────────────────────────────────────────────────────────── */

  evaluateMove() {
    try {
      const round = this.state.rounds.at(-1);
      if (!round) return;

      const key  = String(this.state.moveNumber);
      const move = round.moves.get(key);
      if (!move || move.bids.length < this.state.players.size) return;

      const { winningCard, moveWinner } = calculateMoveWinner(
        move.bids as unknown as IBids[],
      )!;

      move.moveWinner = moveWinner;

      const win = new PlayedCard();
      Object.assign(win, winningCard);
      round.winningCards.push(win);

      this.state.moveNumber++;

      if (this.state.moveNumber < this.MAX_MOVES) {
        // Next move — winner leads
        this.state.nextPlayerIndex =
          this.state.playerUsernames.indexOf(moveWinner);
        this.state.currentTurn = moveWinner;

        // If the move winner is the bot, trigger its turn
        this.maybeTriggerBot();
      } else {
        // Round finished
        round.roundWinner  = moveWinner;
        round.roundStatus  = "complete";

        const sess = this.USER_TO_SESSION_MAP.get(moveWinner);
        if (sess) {
          const p = this.state.players.get(sess)!;
          p.score += calculateRoundPoints(round.winningCards as any);
        } else if (moveWinner === "bot") {
          // Bot won the round — award it points directly
          const botPlayer = this.state.players.get("bot");
          if (botPlayer) {
            botPlayer.score += calculateRoundPoints(round.winningCards as any);
          }
        }

        if (this.checkGameOver()) {
          this.endGame();
          return;
        }

        this.clock.setTimeout(() => {
          this.startNextRound(moveWinner);
        }, 1200);
      }

      this.broadcastGameState();
    } catch (e) {
      console.error("[evaluateMove]", e);
    }
  }

  advanceTurn(winnerName: string): number {
    const i = this.state.playerUsernames.indexOf(winnerName);
    return i === -1
      ? this.state.nextPlayerIndex
      : (i + 1) % this.state.playerUsernames.length;
  }

  startNextRound(roundWinner: string) {
    try {
      this.state.nextPlayerIndex = this.advanceTurn(roundWinner);
      this.startRound(); // startRound calls maybeTriggerBot at the end
    } catch (e) {
      console.error("[startNextRound]", e);
    }
  }

  checkGameOver(): boolean {
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
      this.clock.setTimeout(() => {
        this.disconnect();
      }, this.SECONDS_UNTIL_DISPOSE);
    } catch (e) {
      console.error("[endGame]", e);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     LEAVE / RECONNECT
  ───────────────────────────────────────────────────────────── */

  override async onLeave(client: Client, consented: boolean) {
    try {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      const leaver = player.username;

      if (consented) {
        this.state.players.delete(client.sessionId);
        this.USER_TO_SESSION_MAP.delete(leaver);

        this.broadcast("notification", { message: `${leaver} has left the room` });
        this.broadcastGameState();

        const activePlayers = [...this.state.players.values()].filter(
          (p) => p.active,
        );
        if (activePlayers.length === 1) {
          const lastPlayer       = activePlayers[0];
          lastPlayer.score       = this.state.maxPoints;
          this.state.gameWinner  = lastPlayer.username;
          this.state.gameStatus  = "complete";
          this.broadcast("notification", {
            message: `${lastPlayer.username} wins by default.`,
          });
          this.broadcastGameState();
          this.clock.setTimeout(() => this.disconnect(), 3000);
        }
        return;
      }

      player.active = false;
      await this.allowReconnection(client, 60);

      this.clock.setTimeout(() => {
        const stillInactive =
          this.state.players.get(client.sessionId)?.active === false;

        if (stillInactive) {
          this.state.players.delete(client.sessionId);
          this.USER_TO_SESSION_MAP.delete(leaver);

          this.broadcast("notification", {
            message: `${leaver} was removed after disconnect timeout.`,
          });
          this.broadcastGameState();

          const activePlayers = [...this.state.players.values()].filter(
            (p) => p.active,
          );
          if (activePlayers.length === 0) {
            this.disconnect();
          }
        }
      }, 60 * 1000);
    } catch (e) {
      console.error("[onLeave]", e);
    }
  }
}