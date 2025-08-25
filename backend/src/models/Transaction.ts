import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITransaction extends Document {
  user: Types.ObjectId;
  amount: number;
  category: string;
  type: "Income" | "Expense";
  date: Date;
  description?: string;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ["Income", "Expense"], required: true },
    date: { type: Date, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
