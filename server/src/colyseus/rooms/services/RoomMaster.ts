import GameService from "../../../services/game.service";
import TransactionService from "../../../services/transaction.service";
import { IGameRoom, Payout } from "../../../types/game";
import { Payouts, Player } from "../../schemas/GameState";


export default class RoomMaster {
  private transactionService: TransactionService;
  private gameService: GameService;

  constructor(transactionService: TransactionService, gameService: GameService) {
    this.transactionService = transactionService;
    this.gameService = gameService
  }

  async mint(
    userId: string,
    amount: number,
    transactionType: string,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<{ status: boolean; message: string }> {
    return await this.transactionService.creditCoins(userId, amount, transactionType, reason, metadata);
  }

  async burn(
    userId: string,
    amount: number,
    transactionType: string,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<{ status: boolean; message: string }> {
    return await this.transactionService.debitCoins(userId, amount, transactionType, reason, metadata);
  }

  async deductEntryFee(
    players: Player[],
    entryFee: number,
    roomId: string,
    metadata?: Record<string, any>
  ): Promise<{ status: boolean; message: string }> {
    return await this.transactionService.deductEntryFee(players, entryFee, roomId, metadata)
  }

  async distributePrizePool(
    payouts: Payouts[],
    roomId: string,
    metadata?: Record<string, any>
  ):Promise<{status:boolean, message:string}>{
    return await this.transactionService.distributePrizePool(roomId, payouts, metadata)
  }

  async updateWithFinalGameState (
    gameRoomId: string, 
    gameState: any
  ): Promise<IGameRoom | null | any> {
    return await this.gameService.updateGameState(gameRoomId, gameState);
  }
}
