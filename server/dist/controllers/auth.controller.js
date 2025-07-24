"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../validation/user");
const config_1 = require("../config");
const authUtils_1 = require("../utils/authUtils");
// Register User
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate create user input
        const { error } = user_1.createUserInput.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }
        const { username, password, email } = req.body;
        // Check if user already exists
        const existingUser = yield req.context.services.user.getOne({ username });
        if (existingUser) {
            res.status(400).json({ message: 'Account already exists. Please log in.' });
            return;
        }
        // Hash password and create a user
        const hashedPassword = yield (0, authUtils_1.hashPassword)(password);
        yield req.context.services.user.addOne({
            username,
            email,
            password: hashedPassword,
            balance: 1500
        });
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        next(error);
        return;
    }
});
exports.register = register;
// Login User
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate user login input
        const { error } = user_1.loginUserInput.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }
        // Check if user exists
        const { username, password } = req.body;
        const user = yield req.context.services.user.getOne({ username });
        if (!user) {
            res.status(400).json({ message: "Account doesn't exist. Please sign up." });
            return;
        }
        // Check if password is valid
        const isPasswordValid = yield (0, authUtils_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        ;
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({
            _id: user._id,
            userID: user.userID,
            username: user.username,
            email: user.email,
            role: user.role,
            balance: user.balance
        }, config_1.config.auth.secret, { expiresIn: '7d' });
        res.status(200).json({
            token,
            user: {
                _id: user._id,
                userID: user.userID,
                email: user.email,
                username: user.username,
                role: user.role,
                balance: user.balance
            },
            message: 'Logged in successfully'
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
});
exports.login = login;
