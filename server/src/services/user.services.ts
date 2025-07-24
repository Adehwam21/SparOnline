import { IUser, IRegisterUserInput } from "../types/user";
import { IAppContext, IService } from "../types/app";
import { Types } from "mongoose";

export default class UserService extends IService {
    constructor(props: IAppContext) {
        super(props);
    }

    async addOne(input: IRegisterUserInput): Promise<IUser> {
        try {
            const user = new this.db.UserModel(input);
            await user.save();
            return user;
        } catch (e) {
            throw e;
        }
    }

    async getOne(input: { username: string }): Promise<IUser | any | null> {
        try {
            const user = await this.db.UserModel.findOne({ username: input.username }).select("+password");
            return user || null; // Explicitly returning null if no user is found
        } catch (e) {
            throw e;
        }
    }

    async getById(id: Types.ObjectId | string): Promise<IUser> {
        try {
            const user = await this.db.UserModel.findById(id);

            if (!user) {
                throw new Error("User not found");
            }
            return user;
        } catch (err) {
            throw err;
        }
    }

    async updateOne(input: Partial<IUser>, { user }: { user: any }): Promise<IUser | null> {
        try {
            console.log(user);
            if (!user) {
                throw new Error("Not authenticated");
            }

            const _user = await this.db.UserModel.findByIdAndUpdate(
                user._id,
                {
                    $set: {
                        ...input,
                    },
                },
                { new: true }
            );

            if (!_user) throw new Error("User Not Found");

            console.log(_user);
            return _user;
        } catch (err) {
            throw err;
        }
    }

    async deleteOne(input: Partial<IUser>, { context }: { context: any }): Promise<IUser> {
        try {
            if (!context.user) {
                throw new Error("Not authenticated");
            }

            const user = await this.db.UserModel.findByIdAndDelete(input.userID);
            if (!user) throw new Error("User Not Found");
            return user;
        } catch (err) {
            throw err;
        }
    }

    async getAll({ context }: { context: any }): Promise<IUser[]> {
        try {
            if (!context.user) {
                throw new Error("Not authenticated");
            }

            const users = await this.db.UserModel.find();
            if (!users) throw new Error("Users not found");
            return users;
        } catch (e) {
            throw e;
        }
    }
}
