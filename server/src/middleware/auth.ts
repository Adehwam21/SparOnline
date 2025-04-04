require('dotenv').config();
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { _User } from '../types/user';

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;


// Generate Access Token
export const generateAccessToken = (userID: string) => {
    return jwt.sign({ userID }, JWT_SECRET, { expiresIn: '24h' });
}

// Generate Refresh Token
export const generateRefreshToken = (userID: string) => {
    return jwt.sign({ userID }, REFRESH_SECRET, { expiresIn: '7d' });
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ status: false, message: 'Unauthorized - Missing or Invalid Token' });
        return
    }

    const token = authHeader!.split(' ')[1];

    jwt.verify(token, config.auth.secret, (err, decoded) => {
        if (err) {
            res.status(403).json({ status: false, message: 'Forbidden - Invalid Token' });
            return
        }

        req.user = decoded as _User;
        next();
    });
};


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
