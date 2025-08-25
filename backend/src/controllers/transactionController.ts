// controllers/transactionController.ts
import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import Transaction from "../models/Transaction";

// -------------------
// CRUD
// -------------------

// Add a new transaction
export const addTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, category, type, date, description } = req.body;
    if (!amount || !category || !type || !date) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const transaction = new Transaction({
      user: new mongoose.Types.ObjectId(req.user),
      amount,
      category,
      type,
      date,
      description,
    });

    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error("❌ [addTransaction] Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all transactions for the logged-in user
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const transactions = await Transaction.find({
      user: new mongoose.Types.ObjectId(req.user),
    }).sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("❌ [getTransactions] Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a transaction
export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: new mongoose.Types.ObjectId(req.user),
    });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ [updateTransaction] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a transaction
export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: new mongoose.Types.ObjectId(req.user),
    });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    await transaction.deleteOne();
    res.status(200).json({ success: true, message: "Transaction deleted" });
  } catch (error) {
    console.error("❌ [deleteTransaction] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------
// Charts & Stats
// -------------------

// Monthly stats for a given year
export const getMonthlyStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const monthly = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          income: { $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $eq: ["$type", "Expense"] }, { $multiply: ["$amount", -1] }, 0] } }, // Negative expenses
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Fill missing months
    const result = Array.from({ length: 12 }, (_, i) => {
      const m = monthly.find(x => x._id.month === i + 1);
      return {
        month: `${year}-${String(i + 1).padStart(2, "0")}`,
        income: m?.income || 0,
        expense: m?.expense || 0,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ [getMonthlyStats] Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Yearly stats (totals per year)
export const getYearlyStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);

    const yearly = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { year: { $year: "$date" } },
          income: { $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $eq: ["$type", "Expense"] }, { $multiply: ["$amount", -1] }, 0] } }, // Negative expenses
        },
      },
      { $sort: { "_id.year": 1 } },
    ]);

    res.status(200).json(
      yearly.map(y => ({
        year: y._id.year,
        income: y.income,
        expense: y.expense,
      }))
    );
  } catch (error) {
    console.error("❌ [getYearlyStats] Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Category trends per month for a year
export const getCategoryTrendsMonthly = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const trends = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
      {
        $group: {
          _id: {
            category: "$category",
            type: "$type",
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Pivot data
    const monthKeys = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
    const categories = Array.from(new Set(trends.map(t => t._id.category)));
    const pivot: Record<string, any> = {};
    monthKeys.forEach(m => pivot[m] = { month: m });
    trends.forEach(t => {
      const monthKey = `${year}-${String(t._id.month).padStart(2, "0")}`;
      pivot[monthKey][t._id.category] = t._id.type === "Expense" ? -Math.abs(t.total) : t.total;
    });
    Object.values(pivot).forEach(row => {
      categories.forEach(cat => {
        if (row[cat] == null) row[cat] = 0;
      });
    });

    res.status(200).json(Object.values(pivot));
  } catch (error) {
    console.error("❌ [getCategoryTrendsMonthly] Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Yearly category trends
export const getCategoryTrendsYearly = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);

    const trends = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { category: "$category", type: "$type", year: { $year: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1 } },
    ]);

    const years = Array.from(new Set(trends.map(t => t._id.year)));
    const categories = Array.from(new Set(trends.map(t => t._id.category)));
    const pivot: Record<string, any> = {};
    years.forEach(y => pivot[y] = { year: y });
    trends.forEach(t => {
      pivot[t._id.year][t._id.category] = t._id.type === "Expense" ? -Math.abs(t.total) : t.total;
    });
    Object.values(pivot).forEach(row => {
      categories.forEach(cat => {
        if (row[cat] == null) row[cat] = 0;
      });
    });

    res.status(200).json(Object.values(pivot));
  } catch (error) {
    console.error("❌ [getCategoryTrendsYearly] Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
