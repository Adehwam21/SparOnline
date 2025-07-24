import { Player } from "../colyseus/schemas/GameState";
import { calculatePrizeDistribution } from "../colyseus/utils/roomUtils";
import { IAppContext, IService } from "../types/app";
import { Payout } from "../types/game";

export default class TransactionService extends IService{
  constructor(props: IAppContext){
    super(props)
  }

  async creditCoins(userId: string, amount: number, transactionType: string, reason: string, metadata?: Record<string, any>): Promise<any | null> {
    try {
      
      await this.db.UserModel.updateOne({ userId }, { $inc: { balance: amount }, $set: { updatedAt: new Date() } }, { upsert: true });
      const result = await this.db.TransactionModel.insertOne({
        userId,
        direction: "credit",
        amount,
        transactionType,
        reason,
        metadata,
        createdAt: new Date()
      });

      return result;
    } catch (e: any) {
      throw e;
    }
  }

  async debitCoins(userId: string, amount: number, transactionType: string, reason: string, metadata?: Record<string, any>):Promise<any | null> {
    try {
      const user = await this.db.UserModel.findOne({ userId });
      if (!user || user.balance < amount) throw new Error("Insufficient funds");
      
      await this.db.UserModel.updateOne({ userId }, { $inc: { balance: -amount }, $set: { updatedAt: new Date() } });
      const result = await this.db.TransactionModel.insertOne({
        userId,
        direction: "debit",
        amount,
        transactionType,
        reason,
        metadata,
        createdAt: new Date()
      });

      return result;
    } catch (e: any) {
      throw e;
    }
  }

  async deductEntryFee(
    players: Player[],
    entryFee: number,
    roomId: string,
    metadata?: Record<string, any>
  ): Promise<{ status: boolean; message: string }> {
    const session = await this.db.connection.startSession();

    try {
      session.startTransaction();

      const playerIds = players.map(p => p.mongoId);
      const users = await this.db.UserModel.find(
        { _id: { $in: playerIds } },
        null,
        { session }
      ).lean();

      // Check balance
      for (const player of players) {
        const user = users.find((u: any) => u._id.toString() === player.mongoId);
        if (!user || user.balance < entryFee) {
          throw new Error(`${player.username} has insufficient funds`);
        }
      }

      // Deduct balance + record transaction
      for (const player of players) {
        await this.db.UserModel.updateOne(
          { _id: player.mongoId },
          { $inc: { balance: -entryFee } },
          { session }
        );

        await this.db.TransactionModel.create(
          [{
            userId: player.mongoId,
            direction: "debit",
            amount: entryFee,
            transactionType: "entry_fee",
            reason: `Entry fee for room ${roomId}`,
            metadata: {
              roomId,
              ...metadata,
            },
          }],
          { session }
        );
      }

      await session.commitTransaction();

      return {
        status: true,
        message: "Entry fee successfully deducted",
      };

    } catch (err: any) {
      await session.abortTransaction();

      return {
        status: false,
        message: err.message || "Failed to deduct entry fees",
      };
    } finally {
      await session.endSession();
    }
  }

  async distributePrizePool(
    roomId: string,
    payouts: Payout[],
    metadata?: Record<string, any>
  ) {
    const session = await this.db.connection.startSession();

    try {
      session.startTransaction();
      if (payouts.length === 0) {
        throw new Error("No valid winners for prize pool distribution.");
      }

      const userIds = payouts.map(p => p.userId);
      await this.db.UserModel.find(
        { _id: { $in: userIds } },
        null,
        { session }
      );

      for (const payout of payouts) {
        await this.db.UserModel.updateOne(
          { _id: payout.userId },
          { $inc: { balance: payout.amount } },
          { session }
        );

        await this.db.TransactionModel.create(
          [{
            userId: payout.userId,
            direction: "credit",
            amount: payout.amount,
            transactionType: "game_win",
            reason: `Winnings from room ${roomId}`,
            metadata: { roomId, ...metadata },
          }],
          { session }
        );
      }

      await session.commitTransaction();

      return {
        status: true,
        message: "Prize pool distributed successfully",
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("Error distributing prize pool:", error);
      return {
        status: false,
        message: "Failed to distribute prize pool",
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await session.endSession();
    }
  }
}