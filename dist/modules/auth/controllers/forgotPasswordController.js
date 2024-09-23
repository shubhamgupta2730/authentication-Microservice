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
exports.forgotPassword = void 0;
const AuthModel_1 = __importDefault(require("../../../models/AuthModel"));
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const otpService_1 = require("../../../services/otpService");
const crypto_1 = __importDefault(require("crypto"));
const generateResetToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    try {
        const user = yield AuthModel_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const otpRecord = yield OtpModel_1.default.findOne({ authId: user._id });
        if (!otpRecord) {
            return res.status(404).json({ message: 'otp records not found' });
        }
        const resetToken = generateResetToken();
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        otpRecord.resetToken = hashedToken;
        otpRecord.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        otpRecord.save();
        yield user.save();
        const resetLink = `http://localhost:3000/api/v1/auth/reset-password?token=${resetToken}`;
        const mailSubject = 'Password Reset Link';
        const mailText = `Click the following link to reset your password: ${resetLink}`;
        yield (0, otpService_1.sendResetPasswordLinkToMail)(email, mailText, mailSubject);
        res
            .status(200)
            .json({ message: 'Password reset link sent to your email.' });
    }
    catch (error) {
        console.error('Error sending reset password link:', error);
        res.status(500).json({ message: 'Failed to send reset password link.' });
    }
});
exports.forgotPassword = forgotPassword;
