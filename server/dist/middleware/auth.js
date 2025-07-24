"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
require('dotenv').config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
// Generate Access Token
const generateAccessToken = (userID) => {
    return jsonwebtoken_1.default.sign({ userID }, JWT_SECRET, { expiresIn: '24h' });
};
exports.generateAccessToken = generateAccessToken;
// Generate Refresh Token
const generateRefreshToken = (userID) => {
    return jsonwebtoken_1.default.sign({ userID }, REFRESH_SECRET, { expiresIn: '7d' });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ status: false, message: 'Unauthorized - Missing or Invalid Token' });
        return;
    }
    const token = authHeader.split(' ')[1];
    jsonwebtoken_1.default.verify(token, config_1.config.auth.secret, (err, decoded) => {
        if (err) {
            res.status(403).json({ status: false, message: 'Forbidden - Invalid Token' });
            return;
        }
        req.user = decoded;
        next();
    });
};
exports.verifyToken = verifyToken;
// const checkRole = (requiredRole: string) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         if (!req.user || req.user.role !== requiredRole) {
//             return res.status(403).json({ error: 'Access Denied' });
//         }
//         next();
//     };
// };
// export const admin = checkRole('admin');
// export const customer = checkRole('customer');
