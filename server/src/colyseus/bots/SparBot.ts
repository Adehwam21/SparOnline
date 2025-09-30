import axios from "axios";
import { botNamesByDifficulty, getBotServerUrl } from "./config";
import { IBotPlayResponse, Bot, Difficulty } from "./Bot";
import { getCardSuit } from "../utils/roomUtils";

export class SparBot extends Bot{
  name: string;
  serverUrl: string;

  constructor(difficulty: Difficulty) {
    super(difficulty);
    this.serverUrl = getBotServerUrl(difficulty)
    this.name = botNamesByDifficulty[difficulty];
  }

  override async playMove(gameState: any): Promise<IBotPlayResponse | any> 
  {
    try {
      if (this.difficulty === "easy"){ 
        // If difficulty is easy, just play a valid move to avoid penalties
        const hand = gameState.players["bot"].hand
        const round = gameState.rounds.at(-1);
        if (!round) return;
          const key = String(gameState.moveNumber);
          const move = round.moves.get(key);
          const firstSuit = move?.bids[0]?.suit;
        
          let cardToPlay = hand.find((c: string) => !firstSuit || getCardSuit(c) === firstSuit) || hand[0];
          if (!cardToPlay) return;
          return cardToPlay

        } else { 
          // Make a request to external bot servers for a calculated move
          const response = await axios.post<IBotPlayResponse>(`${this.serverUrl}/play`, gameState);
          return response.data;
        }
      } catch (e: any) {
      console.log('[Bot Error]: ', e)
    }
  }
}
