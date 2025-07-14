import { Room, Client } from "colyseus";
import { ArraySchema } from "@colyseus/schema";
import { GameState, Player } from "../schemas/GameState";
import { GameModeStrategy } from "./strategies/BaseStrategy";
import GameService from "../../services/game.service";
import { GameRoomModel } from "../../models/game.model";
import { options } from "joi";

export class MultiPlayerGameRoom extends Room<GameState> {
  private strategy!: GameModeStrategy;
  private USER_TO_SESSION_MAP = new Map<string, string>();

  configure(strategy: GameModeStrategy) {
    this.strategy = strategy;
  }

  broadcastGameState(){
    this.broadcast("update_state", { roomInfo: this.state });
  }

  onCreate(options: any) {
    if (!options.maxPlayers || !options.maxPoints || !options.creator) {
      throw new Error("Invalid room options");
    }

    this.state = new GameState();
    this.state.deck = new ArraySchema(...this.strategy.getShuffledDeck());
    this.state.roomId = options.roomId || this.roomId;
    this.state.maxPlayers = options.maxPlayers;
    this.state.maxPoints = options.maxPoints;
    this.state.creator = options.creator;

    this.setMetadata(options);

    this.onMessage("play_card", this.handlePlayCard.bind(this));
    this.onMessage("leave_room", this.onLeave.bind(this));
  }

  onJoin(client: Client, { playerUsername }: { playerUsername: string }) {
    const existing = this.USER_TO_SESSION_MAP.get(playerUsername);
    if (existing && this.state.players.has(existing)) {
      const prev = this.state.players.get(existing)!;
      this.state.players.delete(existing);
      prev.id = client.sessionId;
      prev.active = true;
      this.state.players.set(client.sessionId, prev);
      this.USER_TO_SESSION_MAP.set(playerUsername, client.sessionId);
    } else {
      const p = new Player();
      p.id = client.sessionId;
      p.username = playerUsername;
      p.active = true;

      this.state.players.set(client.sessionId, p);
      this.USER_TO_SESSION_MAP.set(playerUsername, client.sessionId);
      this.state.playerUsernames.push(playerUsername);
    }

    if (this.state.players.size >= this.state.maxPlayers) {
      this.state.gameStatus = "ready";
      this.startGame();
    }

    this.broadcastGameState()
  }

  startGame() {
    this.state.gameStatus = "started";
    this.strategy.startGame(this.state);
    this.broadcastGameState()
  }

  handlePlayCard(client: Client, { cardName }: { cardName: string }) {
    try {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.username !== this.state.currentTurn) return;
  
      this.strategy.handlePlayCard(this.state, player, cardName);
      this.broadcastGameState;
      
    } catch (error) {
      console.error("[handlePlayCard]", error)
    }
  }

  override async onLeave(client: Client, consented: boolean) {
      try {
        const player = this.state.players.get(client.sessionId);
        if (!player) return;

        const leaver = player.username;

        if (consented) {
          this.state.players.delete(client.sessionId);
          this.USER_TO_SESSION_MAP.delete(leaver);

          this.broadcastGameState();
          console.log(`[onLeave] : ${leaver} has left with consent`);
          return;
        }

        player.active = false;
        this.broadcastGameState();

        // Wait 60s for reconnection
        await this.allowReconnection(client, 60);

        // If player reconnects in time, do nothing (reconnection handled in `onJoin`)
        // But if they don’t:
        this.clock.setTimeout(() => {
          const stillInactive = this.state.players.get(client.sessionId)?.active === false;

          if (stillInactive) {
            this.state.players.delete(client.sessionId);
            this.USER_TO_SESSION_MAP.delete(leaver);

            this.broadcastGameState();
            console.log(`[onLeave] ${leaver} removed due to inactivity`);
          }
        }, 60 * 1000); // 60 seconds
      } catch (e) {
        console.error("[onLeave]", e);
      }
    }
}
