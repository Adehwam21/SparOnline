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
    const currentIndex = this.state.playerUsernames.indexOf(afterUsername);

    for (let i = 1; i <= total; i++) {
      const nextIndex = (currentIndex + i) % total;
      const username = this.state.playerUsernames[nextIndex];
      const player = [...this.state.players.values()].find(p => p.username === username);

      if (player?.active && !player.eliminated && player.connected) {
        return nextIndex;
      }
    }

    return -1; // No active player found
  }

  private skipIfCurrentTurn(leaverUsername: string) {
    if (this.state.currentTurn !== leaverUsername) return;

    const nextIndex = this.getNextActivePlayerIndex(leaverUsername);
    if (nextIndex !== -1) {
      this.state.nextPlayerIndex = nextIndex;
      this.state.currentTurn = this.state.playerUsernames[nextIndex];

      this.broadcast("notification", {
        message: `Turn skipped. ${leaverUsername} disconnected.`,
      });

      this.broadcastGameState();
    } else {
      this.endGame(); // no one else left
    }
  }

  private nextEliminationRank(): number {
    return ++this.state.eliminationCount;
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
    this.max_clients = this.state.maxPlayers + 1;
    this.state.maxPoints = this.VARIANT === "survival" ? 0 : options.maxPoints;
    this.state.creator = options.creator;
    this.state.eliminationCount = -1
    this.setMetadata(options);

    this.onMessage("play_card", this.handlePlayCard.bind(this));
    this.onMessage("leave_room", this.onLeave);
  }

    private broadcastGameState() {
    this.broadcast("update_state", { roomInfo: this.state  }, {afterNextPatch: true});
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
      
      const currentPlayer = this.state.playerUsernames[this.state.nextPlayerIndex];
      const p = [...this.state.players.values()].find(p => p.username === currentPlayer);

      if (!p || p.eliminated || !p.active || !p.connected) {
        const newIndex = this.getNextActivePlayerIndex(currentPlayer);
        if (newIndex === -1) {
          this.endGame();
          return;
        }
        this.state.nextPlayerIndex = newIndex;
      }

      this.state.currentTurn = this.state.playerUsernames[this.state.nextPlayerIndex];


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

        if (isSuitMismatch && haveSomeCardOfSuit) {
          const penaltyApplied = this.STRATEGY.applyPenalty(
            player,
            {
              minPoints: this.MIN_POINTS,
              nextEliminationRank: () => this.nextEliminationRank(),
              bannedUsers: this.VIOLATORS,
              eliminatedPlayers: this.ELIMINATED_PLAYERS,
            }
          );

          // Ban player from room forever. Handled in reconnection check ins handled 
          if (penaltyApplied) {
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

          const nextIndex = this.getNextActivePlayerIndex(player.username);
          if (nextIndex === -1) {
            this.endGame();
            return;
          }
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
      const expectedMoveCount = [...this.state.players.values()].filter(p => p.active && !p.eliminated).length;
      if (!move || move.bids.length < expectedMoveCount) return;


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

    // Default race logic
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
        player.active = false;
        player.eliminated = true;
        player.rank = this.nextEliminationRank();
        player.hand.clear()
        player.bids.clear()
        this.ELIMINATED_PLAYERS.add(leaver);

        this.broadcast("notification", {
          message: `${leaver} left the room and has been eliminated.`,
        });

        this.broadcastGameState();

        console.log(`[Event] onLeave: ${leaver} voluntarily left — marked as eliminated.`);

        const remainingActivePlayers = [...this.state.players.values()].filter(p => p.active);
        if (remainingActivePlayers.length === 1) {
          const lastPlayer = remainingActivePlayers[0];
          lastPlayer.score = this.state.maxPoints;
          this.state.gameWinner = lastPlayer.username;
          this.state.gameStatus = "complete";

          this.broadcast("notification", {
            message: `${lastPlayer.username} wins by default.`,
          });

          this.broadcastGameState();

          this.clock.setTimeout(() => {
            this.disconnect();
          }, 3000);
        }

        return;
      }


      player.connected = false;
      
      // Wait 60s for reconnection
      await this.allowReconnection(client, 30);

      // If player reconnects in time, do nothing (reconnection handled in `onJoin`)
      // But if they don’t:
      this.clock.setTimeout(() => {
        const stillOffline = this.state.players.get(client.sessionId)?.connected === false;

        if (stillOffline) {
          this.state.players.delete(client.sessionId);
          this.USER_TO_SESSION_MAP.delete(leaver);

          this.broadcast("notification", {
            message: `${leaver} was removed after disconnect timeout.`,
          });
          this.broadcastGameState();

          console.log(`[Event] ${leaver} removed due to inactivity`);

          // Auto-dispose room if no connected players remain
          const connectedPlayers = [...this.state.players.values()].filter(p => p.connected);
          if (connectedPlayers.length === 0) {
            console.log(`[Room] No connected players remaining, disposing room ${this.roomId}`);
            this.disconnect();
          }
        }
      }, 60 * 1000);

    } catch (e) {
      console.error("[onLeave]", e);
    }
  }
}
