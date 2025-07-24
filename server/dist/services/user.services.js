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
const app_1 = require("../types/app");
class UserService extends app_1.IService {
    constructor(props) {
        super(props);
    }
    addOne(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = new this.db.UserModel(input);
                yield user.save();
                return user;
            }
            catch (e) {
                throw e;
            }
        });
    }
    getOne(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.db.UserModel.findOne({ username: input.username }).select("+password");
                return user || null; // Explicitly returning null if no user is found
            }
            catch (e) {
                throw e;
            }
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.db.UserModel.findById(id);
                if (!user) {
                    throw new Error("User not found");
                }
                return user;
            }
            catch (err) {
                throw err;
            }
        });
    }
    updateOne(input_1, _a) {
        return __awaiter(this, arguments, void 0, function* (input, { user }) {
            try {
                console.log(user);
                if (!user) {
                    throw new Error("Not authenticated");
                }
                const _user = yield this.db.UserModel.findByIdAndUpdate(user._id, {
                    $set: Object.assign({}, input),
                }, { new: true });
                if (!_user)
                    throw new Error("User Not Found");
                console.log(_user);
                return _user;
            }
            catch (err) {
                throw err;
            }
        });
    }
    deleteOne(input_1, _a) {
        return __awaiter(this, arguments, void 0, function* (input, { context }) {
            try {
                if (!context.user) {
                    throw new Error("Not authenticated");
                }
                const user = yield this.db.UserModel.findByIdAndDelete(input.userID);
                if (!user)
                    throw new Error("User Not Found");
                return user;
            }
            catch (err) {
                throw err;
            }
        });
    }
    getAll(_a) {
        return __awaiter(this, arguments, void 0, function* ({ context }) {
            try {
                if (!context.user) {
                    throw new Error("Not authenticated");
                }
                const users = yield this.db.UserModel.find();
                if (!users)
                    throw new Error("Users not found");
                return users;
            }
            catch (e) {
                throw e;
            }
        });
    }
}
exports.default = UserService;
