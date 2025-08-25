"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// POST /api/auth/register - Register new user
router.post("/register", authController_1.registerUser);
// POST /api/auth/login - Login user
router.post("/login", authController_1.loginUser);
exports.default = router;
