require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

import { _User } from "../types/user";

export const hashPassword = async (password: string) => {
    const saltRounds = 12;
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        throw error;
    }
};

export const comparePassword = async (password: string, hashedPassword: string | any) => {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error) {
        throw error;
    }
};

export const generateToken = async (match: boolean, _user: _User | any) => {
    try {
        if (match && _user) {
            const token = jwt.sign(
                {
                    id: _user.id,
                    username: _user.username,
                    role: _user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "6h" }
            )
            return token
        }
    } catch (error) {
        throw error;
    }
}

export const generatePasswordResetToken = async (_user: _User | any) => {
    try {
        if (_user) {
            const token = jwt.sign(
                {
                    id: _user.id,
                    username: _user.username,
                    role: _user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "10m" }
            )
            return token
        }
    } catch (error) {
        throw error;
    }
}