"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../types/app");
class TransactionService extends app_1.IService {
    constructor(props) {
        super(props);
    }
    creditCoins(userId, amount, transactionType, reason, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.UserModel.updateOne({ userId }, { $inc: { balance: amount }, $set: { updatedAt: new Date() } }, { upsert: true });
                const result = yield this.db.TransactionModel.insertOne({
                    userId,
                    direction: "credit",
                    amount,
                    transactionType,
                    reason,
                    metadata,
                    createdAt: new Date()
                });
                return result;
            }
            catch (e) {
                throw e;
            }
        });
    }
    debitCoins(userId, amount, transactionType, reason, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.db.UserModel.findOne({ userId });
                if (!user || user.balance < amount)
                    throw new Error("Insufficient funds");
                yield this.db.UserModel.updateOne({ userId }, { $inc: { balance: -amount }, $set: { updatedAt: new Date() } });
                const result = yield this.db.TransactionModel.insertOne({
                    userId,
                    direction: "debit",
                    amount,
                    transactionType,
                    reason,
                    metadata,
                    createdAt: new Date()
                });
                return result;
            }
            catch (e) {
                throw e;
            }
        });
    }
    deductEntryFee(players, entryFee, roomId, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.db.connection.startSession();
            try {
                session.startTransaction();
                const playerIds = players.map(p => p.mongoId);
                const users = yield this.db.UserModel.find({ _id: { $in: playerIds } }, null, { session }).lean();
                // Check balance
                for (const player of players) {
                    const user = users.find((u) => u._id.toString() === player.mongoId);
                    if (!user || user.balance < entryFee) {
                        throw new Error(`${player.username} has insufficient funds`);
                    }
                }
                // Deduct balance + record transaction
                for (const player of players) {
                    yield this.db.UserModel.updateOne({ _id: player.mongoId }, { $inc: { balance: -entryFee } }, { session });
                    yield this.db.TransactionModel.create([{
                            userId: player.mongoId,
                            direction: "debit",
                            amount: entryFee,
                            transactionType: "entry_fee",
                            reason: `Entry fee for room ${roomId}`,
                            metadata: Object.assign({ roomId }, metadata),
                        }], { session });
                }
                yield session.commitTransaction();
                return {
                    status: true,
                    message: "Entry fee successfully deducted",
                };
            }
            catch (err) {
                yield session.abortTransaction();
                return {
                    status: false,
                    message: err.message || "Failed to deduct entry fees",
                };
            }
            finally {
                yield session.endSession();
            }
        });
    }
    distributePrizePool(roomId, payouts, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.db.connection.startSession();
            try {
                session.startTransaction();
                if (payouts.length === 0) {
                    throw new Error("No valid winners for prize pool distribution.");
                }
                const userIds = payouts.map(p => p.userId);
                yield this.db.UserModel.find({ _id: { $in: userIds } }, null, { session });
                for (const payout of payouts) {
                    yield this.db.UserModel.updateOne({ _id: payout.userId }, { $inc: { balance: payout.amount } }, { session });
                    yield this.db.TransactionModel.create([{
                            userId: payout.userId,
                            direction: "credit",
                            amount: payout.amount,
                            transactionType: "game_win",
                            reason: `Winnings from room ${roomId}`,
                            metadata: Object.assign({ roomId }, metadata),
                        }], { session });
                }
                yield session.commitTransaction();
                return {
                    status: true,
                    message: "Prize pool distributed successfully",
                };
            }
            catch (error) {
                yield session.abortTransaction();
                console.error("Error distributing prize pool:", error);
                return {
                    status: false,
                    message: "Failed to distribute prize pool",
                    error: error instanceof Error ? error.message : String(error),
                };
            }
            finally {
                yield session.endSession();
            }
        });
    }
}
exports.default = TransactionService;
