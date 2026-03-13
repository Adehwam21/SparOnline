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
import { SparBot, Variant } from "../../bots/SparBot";
import { Difficulty } from "../../bots/Bot";

export class SpGameRoom extends Room<GameState> {
  MAX_MOVES        = 5;
  MIN_POINTS       = -6;
  BOT_THINK_TIME   = 1000;
  SECONDS_TO_CLOSE = 10 * 1000;

  BOT!:     SparBot;
  VARIANT!: Variant;

  humanSessionId = "";

  override onCreate(options: {
    roomId:        string;
    maxPoints:     number;
    creator:       string;
    botDifficulty: string;
    variant:       Variant;
  }) {
    this.state            = new GameState();
    this.state.roomId     = options.roomId || this.roomId;
    this.state.maxPlayers = 2;
    this.state.maxPoints  = Number(options.maxPoints);
    this.state.creator    = options.creator;
    this.state.variant    = options.variant ?? "race";
    this.VARIANT          = options.variant ?? "race";
    this.BOT              = new SparBot(options.botDifficulty as Difficulty);
    this.maxClients       = 1;

    this.onMessage("play_card", this.handlePlayCard.bind(this));
  }

  override onJoin(client: Client, { playerUsername }: { playerUsername: string }) {
    this.humanSessionId = client.sessionId;

    const human      = new Player();
    human.id         = client.sessionId;
    human.username   = playerUsername;
    human.active     = true;

    const bot        = new Player();
    bot.id           = "bot";
    bot.username     = "bot";
    bot.active       = true;

    this.state.players.set(client.sessionId, human);
    this.state.players.set("bot", bot);
    this.state.playerUsernames.push(playerUsername, "bot");

    // Survival: both players start at maxPoints and drain down to 0
    // Race: both players start at 0 and climb to maxPoints
    if (this.VARIANT === "survival") {
      human.score = this.state.maxPoints;
      bot.score   = this.state.maxPoints;
    }

    this.state.gameStatus = "ready";
    this.startGame();
    this.broadcastGameState();
  }

  private broadcastGameState() {
    this.broadcast("update_state", { roomInfo: this.state });
  }

  /* ─────────────────────────────────────────────────
     GAME FLOW
  ───────────────────────────────────────────────── */

  private startGame() {
    this.state.gameStatus = "started";
    this.startRound();
  }

  private startRound() {
    const deck = secureShuffleDeck(createDeck(), 5);

    const rnd        = new Round();
    rnd.roundNumber  = this.state.rounds.length;
    rnd.moves        = new MapSchema<Moves>();
    rnd.winningCards = new ArraySchema<PlayedCard>();
    rnd.roundStatus  = "in_progress";
    this.state.rounds.push(rnd);
    this.state.moveNumber = 0;

    const human = this.state.players.get(this.humanSessionId)!;
    const bot   = this.state.players.get("bot")!;

    const hands = distributeCards(
      [{ playerName: human.username, hand: [] }, { playerName: "bot", hand: [] }],
      deck,
    );
    human.hand = new ArraySchema(...(hands.find(h => h.playerName === human.username)?.hand ?? []));
    bot.hand   = new ArraySchema(...(hands.find(h => h.playerName === "bot")?.hand ?? []));
    human.bids = new ArraySchema();
    bot.bids   = new ArraySchema();

    // Alternate who leads each round
    const humanLeads       = rnd.roundNumber % 2 === 0;
    this.state.currentTurn = humanLeads ? human.username : "bot";

    this.broadcastGameState();
    this.maybeTriggerBot();
  }

  private endRound(roundWinner: string, pointsEarned: number) {
    const round       = this.state.rounds.at(-1)!;
    round.roundWinner = roundWinner;
    round.roundStatus = "complete";

    const winnerId  = roundWinner === "bot" ? "bot" : this.humanSessionId;
    const loserId   = roundWinner === "bot" ? this.humanSessionId : "bot";
    const winner    = this.state.players.get(winnerId)!;
    const loser     = this.state.players.get(loserId)!;

    if (this.VARIANT === "race") {
      // Race: winner gains points
      winner.score += pointsEarned;

    } else {
      // Survival: winner subtracts points from the opponent's score
      loser.score  -= pointsEarned;
    }

    if (this.checkGameOver()) {
      this.endGame();
      return;
    }

    this.clock.setTimeout(() => this.startRound(), 1200);
  }

  /**
   * Game-over conditions differ by variant:
   *
   * Race:     a player reaches maxPoints → that player wins
   * Survival: a player reaches 0 or below → that player LOSES,
   *           the other player wins
   */
  private checkGameOver(): boolean {
    if (this.VARIANT === "race") {
      for (const p of this.state.players.values()) {
        if (p.score >= this.state.maxPoints) {
          this.state.gameWinner = p.username;
          this.state.gameStatus = "complete";
          return true;
        }
      }

    } else {
      // Survival: whoever hits 0 or below loses
      for (const p of this.state.players.values()) {
        if (p.score <= 0) {
          // The OTHER player wins
          const winner = [...this.state.players.values()].find(
            (pl) => pl.username !== p.username
          );
          this.state.gameWinner = winner?.username ?? "";
          this.state.gameStatus = "complete";
          return true;
        }
      }
    }

    return false;
  }

  private endGame() {
    this.broadcastGameState();
    this.clock.setTimeout(() => this.disconnect(), this.SECONDS_TO_CLOSE);
  }

  /* ─────────────────────────────────────────────────
     BOT TURN
  ───────────────────────────────────────────────── */

  private maybeTriggerBot() {
    if (this.state.currentTurn !== "bot") return;
    if (this.state.gameStatus === "complete") return;

    this.clock.setTimeout(async () => {
      if (this.state.currentTurn !== "bot") return;
      if (this.state.gameStatus === "complete") return;
      await this.botPlayTurn();
    }, this.BOT_THINK_TIME);
  }

  private async botPlayTurn() {
    try {
      const snapshot = this.buildBotSnapshot();
      const response = await this.BOT.playMove(snapshot);
      if (!response?.cardName) return;
      this.applyCard("bot", response.cardName);
    } catch (e) {
      console.error("[botPlayTurn]", e);
    }
  }

  private buildBotSnapshot(): any {
    const human = this.state.players.get(this.humanSessionId)!;
    const bot   = this.state.players.get("bot")!;

    const roundsSnapshot = this.state.rounds.map(rnd => {
      const movesSnapshot: Record<string, any> = {};
      rnd.moves.forEach((move, key) => {
        movesSnapshot[key] = {
          bids:       move.bids.map(b => ({ ...b })),
          moveWinner: move.moveWinner,
        };
      });
      return {
        roundNumber:  rnd.roundNumber,
        moves:        movesSnapshot,
        winningCards: rnd.winningCards.map(c => ({ ...c })),
        roundWinner:  rnd.roundWinner,
        roundStatus:  rnd.roundStatus,
      };
    });

    return {
      moveNumber:  this.state.moveNumber,
      maxPoints:   this.state.maxPoints,
      variant:     this.VARIANT,            // bot needs this to pick the right strategy
      currentTurn: this.state.currentTurn,
      rounds:      roundsSnapshot,
      players: {
        [this.humanSessionId]: { id: human.id, username: human.username, hand: [...human.hand], score: human.score },
        bot:                   { id: bot.id,   username: bot.username,   hand: [...bot.hand],   score: bot.score   },
      },
    };
  }

  /* ─────────────────────────────────────────────────
     CARD PLAY  (shared for human and bot)
  ───────────────────────────────────────────────── */

  handlePlayCard(client: Client, { cardName }: { cardName: string }) {
    const player = this.state.players.get(client.sessionId);
    if (!player || player.username !== this.state.currentTurn) return;
    this.applyCard(client.sessionId, cardName);
  }

  private applyCard(playerId: string, cardName: string) {
    try {
      const player = this.state.players.get(playerId);
      if (!player) return;

      const round = this.state.rounds.at(-1);
      if (!round) return;

      const key = String(this.state.moveNumber);
      if (!round.moves.has(key)) round.moves.set(key, new Moves());
      const move = round.moves.get(key)!;

      const newCard = new PlayedCard();
      Object.assign(newCard, makeCard(player.username, cardName, move.bids.length));
      move.bids.push(newCard);
      player.bids.push(newCard.cardName);

      const idx = player.hand.indexOf(cardName);
      if (idx !== -1) player.hand.splice(idx, 1);

      // ── Penalty check ──
      if (move.bids.length > 1) {
        const leadSuit         = move.bids[0]!.suit;
        const stillHasLeadSuit = player.hand.some(c => getCardSuit(c) === leadSuit);

        if (newCard.suit !== leadSuit && stillHasLeadSuit) {
          player.score -= 3;
          this.broadcast("notification", {
            message: `${player.username} played the wrong suit — 3 point penalty!`,
          });

          // Human hitting the floor ends the game
          if (playerId !== "bot" && player.score <= this.MIN_POINTS) {
            this.state.gameWinner = "bot";
            this.state.gameStatus = "complete";
            this.broadcastGameState();
            this.clock.setTimeout(() => this.disconnect(), 3000);
            return;
          }

          this.broadcastGameState();
          this.clock.setTimeout(() => this.startRound(), 2000);
          return;
        }
      }

      // ── Both players have played ──
      if (move.bids.length === 2) {
        this.evaluateMove();
      } else {
        this.state.currentTurn = playerId === "bot"
          ? this.state.players.get(this.humanSessionId)!.username
          : "bot";
        this.maybeTriggerBot();
      }

      this.broadcastGameState();
    } catch (e) {
      console.error("[applyCard]", e);
    }
  }

  /* ─────────────────────────────────────────────────
     MOVE EVALUATION
  ───────────────────────────────────────────────── */

  private evaluateMove() {
    const round = this.state.rounds.at(-1)!;
    const move  = round.moves.get(String(this.state.moveNumber))!;

    const { winningCard, moveWinner } = calculateMoveWinner(
      move.bids as unknown as IBids[],
    )!;

    move.moveWinner = moveWinner;
    const win = new PlayedCard();
    Object.assign(win, winningCard);
    round.winningCards.push(win);

    this.state.moveNumber++;

    if (this.state.moveNumber < this.MAX_MOVES) {
      this.state.currentTurn = moveWinner;
      this.maybeTriggerBot();
    } else {
      // All 5 moves done — calculate points and end the round
      const pointsEarned = calculateRoundPoints(round.winningCards as any);
      this.endRound(moveWinner, pointsEarned);
    }

    this.broadcastGameState();
  }

  /* ─────────────────────────────────────────────────
     LEAVE
  ───────────────────────────────────────────────── */

  override onLeave(client: Client, consented: boolean) {
    this.broadcast("notification", { message: "Player left — room closing." });
    this.clock.setTimeout(() => this.disconnect(), 3000);
  }
}