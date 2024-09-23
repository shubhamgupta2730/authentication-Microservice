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
exports.changePassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const AuthModel_1 = __importDefault(require("../../../models/AuthModel"));
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword, verifyNewPassword } = req.body;
    const userId = req.userId;
    if (!currentPassword || !newPassword || !verifyNewPassword) {
        return res.status(400).json({
            message: ' current password, and new password are required.',
        });
    }
    if (newPassword !== verifyNewPassword) {
        return res.status(400).json({
            message: 'new password and verify new password does not match.',
        });
    }
    try {
        const user = yield AuthModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res
                .status(400)
                .json({ message: 'Current password is incorrect.' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        res.status(200).json({ message: 'Password changed successfully.' });
    }
    catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password.' });
    }
});
exports.changePassword = changePassword;
