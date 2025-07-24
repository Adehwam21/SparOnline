import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { _User } from '../types/user';
import { createUserInput, loginUserInput } from '../validation/user';
import { config } from '../config';
import { comparePassword, hashPassword } from '../utils/authUtils';

// Register User
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Validate create user input
        const { error } = createUserInput.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }

        const { username, password, email} = req.body;

        // Check if user already exists
        const existingUser = await req.context!.services!.user.getOne({ username });
        if (existingUser) {
            res.status(400).json({ message: 'Account already exists. Please log in.' });
            return;
        }

        // Hash password and create a user
        const hashedPassword = await hashPassword(password);
        await req.context!.services!.user.addOne({
            username,
            email,
            password: hashedPassword,
            balance: 1500
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
        return;
    }
};

// Login User
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate user login input
        const { error } = loginUserInput.validate(req.body);

        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }

        // Check if user exists
        const { username, password } = req.body;
        const user = await req.context!.services!.user!.getOne({ username });
        if (!user) {
            res.status(400).json({ message: "Account doesn't exist. Please sign up." });
            return;
        }

        // Check if password is valid
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        };

        // Create JWT token
        const token = jwt.sign(
            {
                _id: user!._id,
                userID: user!.userID,
                username: user!.username,
                email: user!.email, 
                role: user!.role,
                balance: user!.balance
            },
            config.auth!.secret!,
            { expiresIn: '7d'} 
        );

        res.status(200).json({ 
            token,
            user:{
                _id: user!._id,
                userID: user!.userID,
                email: user!.email,
                username: user!.username,
                role: user!.role,
                balance: user!.balance
            },
            message: 'Logged in successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};
