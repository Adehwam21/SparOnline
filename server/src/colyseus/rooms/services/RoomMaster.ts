import GameService from "../../../services/game.service";
import TransactionService from "../../../services/transaction.service";

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
  ) {
    return await this.transactionService.creditCoins(userId, amount, transactionType, reason, metadata);
  }

  async burn(
    userId: string,
    amount: number,
    transactionType: string,
    reason: string,
    metadata?: Record<string, any>
  ) {
    return await this.transactionService.debitCoins(userId, amount, transactionType, reason, metadata);
  }

  async updateWithFinalGameState (
    gameRoomId: string, 
    gameState: any
  ) {
    return await this.gameService.updateGameState(gameRoomId, gameState);
  }
}
