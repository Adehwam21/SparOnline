import { timeStamp } from "console";
import mongoose, { Model, Document, Schema } from "mongoose";
import {v4 as uuidv4} from "uuid";

export type TransactionDirection = "credit" | "debit";

export type TransactionType =
  | "real_money_purchase"
  | "game_win"
  | "revive"
  | "entry_fee"
  | "daily_bonus"
  | "level_up_reward"
  | "referral_bonus"
  | "event_reward"
  | "admin_grant"
  | "admin_deduction"
  | "bug_compensation"
  | "anti_fraud"
  | "send_to_player"
  | "receive_from_player";

interface TransactionMetadata {
  // Common optional fields
  roomId?: string;
  gameMode?: string;

  // For item purchases
  itemId?: string;
  itemType?: string;
  storeCategory?: string;

  // For game rewards
  rank?: number;

  // For payment transactions
  paymentProvider?: "Flutterwave" | "Stripe" | "Paystack" | string;
  fiatAmount?: number;
  currency?: string;
  txRef?: string; // external payment reference
  itemPackId?: string; // coin pack identifier

  // For developer/debugging
  [key: string]: any; // allow extensions
}

export interface ITransaction {
  transactionId: string,
  userId: string;
  direction: TransactionDirection;
  transactionType: TransactionType;
  amount: number; // Always positive, use `direction` for meaning
  balanceAfter?: number; // Optional: for snapshotting post-transaction balance
  gameId?: string; // Optional: for game-related transactions
  reason?: string; // Optional: freeform explanation
  metadata: TransactionMetadata
  createdAt: Date;
}

export interface ITransactionDocument extends Document, ITransaction {}
export interface ITransactionModel extends Model<ITransactionDocument> {}

const TransactionSchema = new Schema<ITransactionDocument>({
  transactionId: { type: String, default: uuidv4, unique: true, index: true },
  userId: {type: String, required: true, unique:true, ref: "User"},
  direction: { type: String, enum: ["credit", "debit"], required: true },
  transactionType: {
    type: String,
    enum: [
      "real_money_purchase", "game_win", "revive", "entry_fee",
      "daily_bonus", "level_up_reward", "referral_bonus",
      "event_reward", "admin_grant", "admin_deduction",
      "bug_compensation", "anti_fraud",
      "send_to_player", "receive_from_player"
    ],
    required: true
  },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number },
  gameId: { type: String },
  reason: { type: String },
  metadata: { type: Schema.Types.Mixed, required: false, default: {} }
}, {timestamps: true});

export const TransactionModel = mongoose.model("Transaction", TransactionSchema);