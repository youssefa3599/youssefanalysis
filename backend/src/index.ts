import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";

// Import routes
import transactionRoutes from "./routes/transactionRoutes";
import authRoutes from "./routes/authRoutes"; // Only if you already have this

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Budget Tracker API is running...");
});

app.use("/api/auth", authRoutes); // Protects auth endpoints
app.use("/api/transactions", transactionRoutes); // Protects transaction endpoints

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


