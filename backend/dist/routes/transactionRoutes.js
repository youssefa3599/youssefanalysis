"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/transactionRoutes.ts
const express_1 = __importDefault(require("express"));
const transactionController_1 = require("../controllers/transactionController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
// Create new transaction
router.post("/", authMiddleware_1.default, transactionController_1.addTransaction);
// Get all transactions
router.get("/", authMiddleware_1.default, transactionController_1.getTransactions);
// Update a transaction
router.put("/:id", authMiddleware_1.default, transactionController_1.updateTransaction);
// Delete a transaction
router.delete("/:id", authMiddleware_1.default, transactionController_1.deleteTransaction);
// Dashboard stats
router.get("/monthly-stats", authMiddleware_1.default, transactionController_1.getMonthlyStats);
router.get("/yearly-stats", authMiddleware_1.default, transactionController_1.getYearlyStats);
// Category trends
router.get("/category-trends-monthly", authMiddleware_1.default, transactionController_1.getCategoryTrendsMonthly);
router.get("/category-trends-yearly", authMiddleware_1.default, transactionController_1.getCategoryTrendsYearly);
exports.default = router;
