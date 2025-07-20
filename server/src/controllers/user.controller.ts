import { Request, Response } from 'express';
import { _User } from '../types/user';

// Get User Profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user;
        console.log(user)

        if (!user._id){
          res.status(401).json({message: "Unauthorized"})
          return;
        }

        const _user = await req.context!.services!.user!.getById(user!._id);
        if (!_user) {
          res.status(404).json({ message: 'User profile not found' });
          return;
        }

        res.status(200).json({ profile: _user, message:"User profile found" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};

