import { Room } from "colyseus";
import { GameState } from "../../schemas/GameState";
import { MultiPlayerGameRoom } from "../MpRoom";
import { GameModeStrategyFactory } from "./GameModeStrategyFactory";

export interface RoomOptions {
  roomId: string;
  creator: string;
  gameType: string;
  gameMode: "race" | "survival" | "custom";
  maxPlayers: string;
  maxPoints: string;
  bettingEnabled: boolean;
  entryFee: number;
}

export class RoomFactory {
  static createMultiplayerRoom(): new () => Room<GameState> {
    return class extends MultiPlayerGameRoom {
      override onCreate(options: any) {
        const strategy = GameModeStrategyFactory.getStrategy(options.gameMode);
        this.configure(strategy);
        super.onCreate(options); // options come from matchMaker.create()
      }
    };
  }

  // Add for single room later
}
