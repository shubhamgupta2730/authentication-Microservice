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
exports.resetPassword = void 0;
const AuthModel_1 = __importDefault(require("../../../models/AuthModel"));
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    const { newPassword } = req.body;
    if (!token || !newPassword) {
        return res
            .status(400)
            .json({ message: 'Token and new password are required.' });
    }
    try {
        const resetToken = token.toString();
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        const otpRecord = yield OtpModel_1.default.findOne({
            resetToken: hashedToken,
            resetTokenExpires: { $gt: Date.now() },
        });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        const user = yield AuthModel_1.default.findOne({ _id: otpRecord.authId });
        if (!user) {
            return res.status(400).json({ message: 'auth record not found' });
        }
        user.password = hashedPassword;
        otpRecord.resetToken = undefined;
        otpRecord.resetTokenExpires = undefined;
        yield otpRecord.save();
        yield user.save();
        res.status(200).json({ message: 'Password reset successful.' });
    }
    catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Failed to reset password.' });
    }
});
exports.resetPassword = resetPassword;
