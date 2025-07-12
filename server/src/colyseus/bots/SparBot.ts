import axios from "axios";
import { botNamesByDifficulty, botServerUrl, getBotServerUrl } from "../config/bot-config";
import { IBotPlayResponse, Bot, Difficulty } from "./Bot";

export class SparBot extends Bot{
  name: string;
  serverUrl: string;

  constructor(difficulty: Difficulty) {
    super(difficulty);
    this.serverUrl = getBotServerUrl(difficulty)
    this.name = botNamesByDifficulty[difficulty];
  }

  override async play(gameState: any): Promise<IBotPlayResponse> {
    const response = await axios.post<IBotPlayResponse>(`${this.serverUrl}/play`, gameState);
    return response.data;
  }
}
