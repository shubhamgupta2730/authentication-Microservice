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
exports.verifyOTPController = void 0;
const AuthModel_1 = __importDefault(require("../../../models/AuthModel"));
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const generateToken_1 = require("../../../utils/generateToken");
const otpService_1 = require("../../../services/otpService");
const verifyOTPController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, otp, emailOtp, phoneOtp } = req.body;
    if (!userId) {
        return res.status(400).json({
            message: 'Enter all the fields.',
        });
    }
    try {
        const user = yield AuthModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const otpRecord = yield OtpModel_1.default.findOne({ authId: userId });
        if (!otpRecord) {
            return res.status(404).json({ message: 'OTP record not found.' });
        }
        let isVerified = false;
        let message = '';
        let type = '';
        let token;
        if (emailOtp) {
            isVerified = yield (0, otpService_1.verifyEmailOTP)(user.email, emailOtp);
            message = 'Email OTP';
            type = 'email';
        }
        else if (phoneOtp) {
            isVerified = yield (0, otpService_1.verifyPhoneOTP)(user.phone, phoneOtp);
            message = 'Phone OTP';
            type = 'phone';
        }
        else {
            type = user.twoFactorMethod;
            switch (type) {
                case 'email':
                    isVerified = yield (0, otpService_1.verifyEmailOTP)(user.email, otp);
                    message = 'Email OTP';
                    break;
                case 'phone':
                    isVerified = yield (0, otpService_1.verifyPhoneOTP)(user.phone, otp);
                    message = 'Phone OTP';
                    break;
                case 'authenticator':
                    if (!otpRecord.twoFactorSecret) {
                        return res.status(400).json({
                            message: 'User does not have an authenticator secret set up.',
                        });
                    }
                    isVerified = (0, otpService_1.verifyAuthenticatorOTP)(otp, otpRecord.twoFactorSecret);
                    message = 'Authenticator App OTP';
                    break;
                default:
                    return res
                        .status(400)
                        .json({ message: 'Invalid OTP verification type.' });
            }
        }
        if (!isVerified) {
            return res
                .status(400)
                .json({ message: `Invalid ${message} or credentials.` });
        }
        // Remove OTP from database based on verification type
        if (type === 'email') {
            otpRecord.emailOtp = undefined;
            otpRecord.emailOtpExpires = undefined;
            user.isEmailVerified = true;
        }
        else if (type === 'phone') {
            otpRecord.phoneOtp = undefined;
            otpRecord.phoneOtpExpires = undefined;
            user.isPhoneVerified = true;
        }
        yield otpRecord.save();
        yield user.save();
        token = (0, generateToken_1.generateToken)(userId, user.role);
        res
            .status(200)
            .json({ message: `${message} verified successfully.`, token });
    }
    catch (error) {
        console.error(`Error verifying OTP:`, error);
        res.status(500).json({ message: `Failed to verify OTP.` });
    }
});
exports.verifyOTPController = verifyOTPController;
