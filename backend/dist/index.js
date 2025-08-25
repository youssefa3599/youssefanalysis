"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
// Import routes
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes")); // Only if you already have this
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.get("/", (req, res) => {
    res.send("Budget Tracker API is running...");
});
app.use("/api/auth", authRoutes_1.default); // Protects auth endpoints
app.use("/api/transactions", transactionRoutes_1.default); // Protects transaction endpoints
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
