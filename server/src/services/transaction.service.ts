import { IAppContext, IService } from "../types/app";

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
    } catch (e) {
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
    } catch (e) {
      throw e;
    }
  }

}