// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: string;  // JWT user ID
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log("📌 Incoming request headers:", req.headers);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("⚠️ No token found in headers.");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  console.log("📌 Token received:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    console.log("📌 Decoded JWT payload:", decoded);

    req.user = decoded.id;
    console.log("📌 req.user set to:", req.user);
    next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error);
    res.status(401).json({ message: "Token is invalid" });
  }
};

export default authMiddleware;
