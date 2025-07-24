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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePasswordResetToken = exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const saltRounds = 12;
    try {
        const salt = yield bcrypt.genSalt(saltRounds);
        const hash = yield bcrypt.hash(password, salt);
        return hash;
    }
    catch (error) {
        throw error;
    }
});
exports.hashPassword = hashPassword;
const comparePassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const match = yield bcrypt.compare(password, hashedPassword);
        return match;
    }
    catch (error) {
        throw error;
    }
});
exports.comparePassword = comparePassword;
const generateToken = (match, _user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (match && _user) {
            const token = jwt.sign({
                id: _user.id,
                username: _user.username,
                role: _user.role,
                balance: _user.role
            }, process.env.JWT_SECRET, { expiresIn: "6h" });
            return token;
        }
    }
    catch (error) {
        throw error;
    }
});
exports.generateToken = generateToken;
const generatePasswordResetToken = (_user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (_user) {
            const token = jwt.sign({
                id: _user.id,
                username: _user.username,
                role: _user.role
            }, process.env.JWT_SECRET, { expiresIn: "10m" });
            return token;
        }
    }
    catch (error) {
        throw error;
    }
});
exports.generatePasswordResetToken = generatePasswordResetToken;
