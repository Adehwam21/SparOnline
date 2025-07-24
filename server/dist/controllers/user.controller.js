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
exports.getUserProfile = void 0;
// Get User Profile
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user._id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const _user = yield req.context.services.user.getById(user._id);
        if (!_user) {
            res.status(404).json({ message: 'User profile not found' });
            return;
        }
        res.status(200).json({ profile: _user, message: "User profile found" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
});
exports.getUserProfile = getUserProfile;
