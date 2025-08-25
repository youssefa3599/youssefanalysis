"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User")); // Import User model and IUser interface
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";
const JWT_EXPIRES_IN = "7d";
// Generate JWT Token
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = new User_1.default({ username, email, password });
        await user.save();
        const token = generateToken(user._id.toString());
        res.status(201).json({
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
            },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.registerUser = registerUser;
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }
        // Cast user to IUser | null so TypeScript knows about _id etc
        const user = (await User_1.default.findOne({ email }));
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = generateToken(user._id.toString());
        res.status(200).json({
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
            },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.loginUser = loginUser;
