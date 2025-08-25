"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("📌 Incoming request headers:", req.headers);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("⚠️ No token found in headers.");
        return res.status(401).json({ message: "No token, authorization denied" });
    }
    const token = authHeader.split(" ")[1];
    console.log("📌 Token received:", token);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("📌 Decoded JWT payload:", decoded);
        req.user = decoded.id;
        console.log("📌 req.user set to:", req.user);
        next();
    }
    catch (error) {
        console.error("❌ JWT verification failed:", error);
        res.status(401).json({ message: "Token is invalid" });
    }
};
exports.default = authMiddleware;
