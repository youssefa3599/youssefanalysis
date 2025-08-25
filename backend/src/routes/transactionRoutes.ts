// src/routes/transactionRoutes.ts
import express from "express";
import {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getMonthlyStats,
  getYearlyStats,
  getCategoryTrendsMonthly,
  getCategoryTrendsYearly,
} from "../controllers/transactionController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// Create new transaction
router.post("/", authMiddleware, addTransaction);

// Get all transactions
router.get("/", authMiddleware, getTransactions);

// Update a transaction
router.put("/:id", authMiddleware, updateTransaction);

// Delete a transaction
router.delete("/:id", authMiddleware, deleteTransaction);

// Dashboard stats
router.get("/monthly-stats", authMiddleware, getMonthlyStats);
router.get("/yearly-stats", authMiddleware, getYearlyStats);

// Category trends
router.get("/category-trends-monthly", authMiddleware, getCategoryTrendsMonthly);
router.get("/category-trends-yearly", authMiddleware, getCategoryTrendsYearly);

export default router;
