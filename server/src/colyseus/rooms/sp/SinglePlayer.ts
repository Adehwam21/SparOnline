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
  shuffleDeck,
  calculateRoundPoints,
  distributeCards,
  calculateMoveWinner,
  getCardRank,
  getCardSuit,
  getCardValue,
  getCardPoints,
} from "../../utils/roomUtils";
import { IBids } from "../../../types/game";
import { Bot, Difficulty } from "../../bots/Bot";
import { SparBot } from "../../bots/SparBot";

export class SinglePlayerRoom extends Room<GameState> {
  DECK = shuffleDeck(createDeck());
  BOT: SparBot | undefined;
  MAX_CLIENTS = 1;
  MAX_MOVES = 5;
  USER_TO_SESSION_MAP = new Map<string, string>();
  SECONDS_UNTIL_DISPOSE = 60 * 1000

  override onCreate(
    options: { roomId: string; maxPoints: number; creator: string, difficulty: string},
  ) {
    this.BOT = new SparBot(options.difficulty as Difficulty);
    this.state = new GameState();
    this.state.deck = new ArraySchema(...this.DECK);
    this.state.roomId = options.roomId || this.roomId;
    this.state.maxPlayers = 1;
    this.MAX_CLIENTS = 2;
    this.state.maxPoints = Number(options.maxPoints);
    this.state.creator = options.creator;
    this.setMetadata(options);

    this.onMessage("play_card", this.handlePlayCard.bind(this));
    this.onMessage("leave_room", this._onLeave);
  }

  override onJoin(client: Client, { playerUsername }: { playerUsername: string }) {
    try { // ⚠️ reconnect / new‑join can throw if Map ops fail
      const existing = this.USER_TO_SESSION_MAP.get(playerUsername);

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

      // Set the bot
      if (this.state.players.size >= this.state.maxPlayers) {
        const botPlayer = new Player();
        botPlayer.id = "bot";
        botPlayer.username = this.BOT!.name;
        botPlayer.active = true;

        this.state.playerUsernames.push(this.BOT!.name);
        this.state.players.set("bot", botPlayer);

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

      const pc = new PlayedCard();
      pc.playerName = player.username;
      pc.cardName = cardName;
      pc.rank = getCardRank(cardName);
      pc.suit = getCardSuit(cardName);
      pc.value = getCardValue(cardName);
      pc.point = getCardPoints(cardName);
      pc.bidIndex = move.bids.length;

      player.bids.push(pc.cardName);
      move.bids.push(pc);

      const idx = player.hand.indexOf(cardName);
      if (idx !== -1) player.hand.splice(idx, 1);

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

      /* round in progress */
      if (this.state.moveNumber < this.MAX_MOVES) {
        this.state.nextPlayerIndex = this.state.playerUsernames.indexOf(moveWinner);
        this.state.currentTurn = moveWinner;

        if (moveWinner === this.BOT!.name) {
          setTimeout(() => this.botPlayCard(), 800);
          console.log("[Bot]: Played card", )
        }
      } else {
        /* round finished */
        round.roundWinner = moveWinner;

        const sess = this.USER_TO_SESSION_MAP.get(moveWinner);
        if (sess) {
          const p = this.state.players.get(sess)!;
          p.score += calculateRoundPoints(round.winningCards as any);
        }
        round.roundStatus = "complete";

        if (this.checkGameOver()) {
          this.endGame();
          return;
        }
        this.startNextRound(moveWinner);
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

      // Dispose the room after one minute
      setTimeout(() => {
        this.disconnect(4000)
      }, (this.SECONDS_UNTIL_DISPOSE))

    } catch (e) {
      console.error("[endGame]", e);
    }
  }

  private async botPlayCard() {
    try {
      const round = this.state.rounds.at(-1);
      if (!round) return;

      const botState = {
        hand: this.state.players.get("bot")?.hand || [],
        currentMoves: round.moves.get(String(this.state.moveNumber)),
        // TODO: Add more states later
      };

      const { cardName } = await this.BOT!.play(botState);
      this.handlePlayCard({ sessionId: "bot" } as Client, { cardName });
    } catch (e) {
      console.error("[BotPlayCard]", e);
    }
  }

  override async onLeave(client: Client, consented: boolean) {
    try {
      this.state.players.get(client.sessionId)!.active = false;

      if (consented) {
        this.state.players.delete(client.sessionId);
        console.log(`Left: ${client.sessionId}`);
        return;
      }
      await this.allowReconnection(client, 60);
      this.state.players.get(client.sessionId)!.active = true;
    } catch (e) {
      console.error("[onLeave]", e);
    }
  }
}
