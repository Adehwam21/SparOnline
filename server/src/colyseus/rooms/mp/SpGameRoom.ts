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
  getCardRank,
  getCardSuit,
  getCardValue,
  getCardPoints,
} from "../../utils/roomUtils";
import { IBids } from "../../../types/game";
import { SurvivalModeStrategy } from "../strategy/SurvivalModeStrategy";
import { RaceModeStrategy } from "../strategy/RaceModeStrategy";
import { IGameModeStrategy } from "../strategy/IGameModeStrategy";

export class SpGameRoom extends Room<GameState> {
  DECK = secureShuffleDeck(createDeck(), 10);
  MAX_CLIENTS = 4;
  MAX_MOVES = 5;
  MIN_POINTS = -15
  STRATEGY!: IGameModeStrategy;
  USER_TO_SESSION_MAP = new Map<string, string>();
  BANNED_USERS = new Set<string>();
  SECONDS_UNTIL_DISPOSE = 10 * 1000

  override onCreate(
    options: { roomId: string; maxPlayers: number; maxPoints: number; creator: string, variant: string },
  ) {
    const variant = options.variant ?? "race";
    this.STRATEGY = variant === "survival" ? new SurvivalModeStrategy() : new RaceModeStrategy();
    this.state = new GameState();
    this.state.deck = new ArraySchema(...this.DECK);
    this.state.roomId = options.roomId || this.roomId;
    this.state.maxPlayers = Number(options.maxPlayers);
    this.MAX_CLIENTS = this.state.maxPlayers + 1;
    this.state.maxPoints = Number(options.maxPoints);
    this.state.creator = options.creator;
    this.setMetadata(options);

    this.onMessage("play_card", this.handlePlayCard.bind(this));
    this.onMessage("leave_room", this.onLeave);
  }

  override onJoin(client: Client, { playerUsername }: { playerUsername: string }) {
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
      const p = new Player();
      p.id = client.sessionId;
      p.username = playerUsername;
      p.active = true;

      if (!this.state.playerUsernames.includes(playerUsername)) {
        this.state.playerUsernames.push(playerUsername);
      }
      this.state.players.set(client.sessionId, p);
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
    this.broadcast("update_state", { roomInfo: this.state  }, {afterNextPatch: true});
  }

  /* ───────── GAME FLOW ───────── */

  private dealCards(deck: string[]) {
    const playersArr = Array.from(this.state.players.values());

    const hands = distributeCards(
      playersArr.map(p => ({ playerName: p.username, hand: [] })),
      deck
    );

    for (const p of playersArr) {
      const h = hands.find(h => h.playerName === p.username);
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

      /* deal */
      this.dealCards(this.DECK)
      
      this.state.currentTurn =
        this.state.playerUsernames[this.state.nextPlayerIndex];

      rnd.moves = new MapSchema<Moves>();
      rnd.winningCards = new ArraySchema<PlayedCard>();
      rnd.roundStatus = "in_progress";

      this.broadcastGameState();
    } catch (e) {
      console.error("[startRound]", e);
    }
  }

  handlePlayCard(client: Client, { cardName }: { cardName: string }) {
    try {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.username !== this.state.currentTurn) return;

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

      // Add card to player and move
      player.bids.push(newCard.cardName);
      move.bids.push(newCard);

      // Remove card from hand
      const idx = player.hand.indexOf(cardName);
      if (idx !== -1) player.hand.splice(idx, 1);

      // Check for violation and penalize
      if (move.bids.length > 1) {
        const firstSuit = move.bids[0].suit;
        const currentSuit = newCard.suit;

        // Check if player has any card of the same suit
        const haveSomeCardOfSuit = player.hand.some(card => getCardSuit(card) === firstSuit);
        const isSuitMismatch = currentSuit !== firstSuit;

        // Check for violations an penalize
        if (isSuitMismatch && haveSomeCardOfSuit) {
          player.score -= 3;

          // Bar player from room forever. Handled in join as well
          if (player.score <= this.MIN_POINTS) {
            this.state.players.delete(client.sessionId);
            this.USER_TO_SESSION_MAP.delete(player.username);

            this.broadcast("notification", {
              message: `${player.username} was removed for repeated violations (score too low).`,
            });

            this.broadcastGameState();

            const activePlayers = [...this.state.players.values()].filter(p => p.active);
            if (activePlayers.length === 1) {
              const lastPlayer = activePlayers[0];
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

      // Proceed to next turn or evaluate move
      if (move.bids.length === this.state.players.size) {
        this.evaluateMove();
      } else {
        this.state.nextPlayerIndex =
          (this.state.nextPlayerIndex + 1) % this.state.players.size;
        this.state.currentTurn =
          this.state.playerUsernames[this.state.nextPlayerIndex];
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
      if (!move || move.bids.length < this.state.players.size) return;

      const { winningCard, moveWinner } = calculateMoveWinner(
        move.bids as unknown as IBids[],
      )!;
      move.moveWinner = moveWinner;

      const win = new PlayedCard();
      Object.assign(win, winningCard);
      round.winningCards.push(win);

      this.state.moveNumber++;

      // round in progress
      if (this.state.moveNumber < this.MAX_MOVES) {
        this.state.nextPlayerIndex =
          this.state.playerUsernames.indexOf(moveWinner);
        this.state.currentTurn = moveWinner;
      } else {
        // round finished
        round.roundWinner = moveWinner;
        this.STRATEGY.awardPoints(round, this.state.players);
        round.roundStatus = "complete";

        if (this.checkGameOver()) {
          this.endGame();
          return;
        }
        this.clock.setTimeout(() => {
          this.startNextRound(moveWinner);
        }, 1200)
      }
      this.broadcastGameState();
    } catch (e) {
      console.error("[evaluateMove]", e);
    }
  }

  advanceTurn(winnerName: string): number {
    const i = this.state.playerUsernames.indexOf(winnerName);
    return i === -1 ? this.state.nextPlayerIndex : (i + 1) % this.state.playerUsernames.length;
  }

  startNextRound(roundWinner: string) {
    try {
      
      this.state.nextPlayerIndex = this.advanceTurn(roundWinner);
      this.startRound();
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

      // Dispose the room after 10 seconds
      this.clock.setTimeout(() => {
        this.disconnect(4000)
      }, (this.SECONDS_UNTIL_DISPOSE))

    } catch (e) {
      console.error("[endGame]", e);
    }
  }

  override async onLeave(client: Client, consented: boolean) {
    try {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
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
      await this.allowReconnection(client, 60);

      // If player reconnects in time, do nothing (reconnection handled in `onJoin`)
      // But if they don’t:
      this.clock.setTimeout(() => {
        const stillInactive = this.state.players.get(client.sessionId)?.active === false;

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

    } catch (e) {
      console.error("[onLeave]", e);
    }
  }
}
