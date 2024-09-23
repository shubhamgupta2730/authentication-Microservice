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
exports.signIn = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const AuthModel_1 = __importDefault(require("../../../models/AuthModel"));
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const generateToken_1 = require("../../../utils/generateToken");
const otpService_1 = require("../../../services/otpService");
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: 'Email and password are required.' });
    }
    try {
        const user = yield AuthModel_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const otpRecord = yield OtpModel_1.default.findOne({ authId: user._id });
        if (!otpRecord) {
            return false;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password.' });
        }
        if (!user.isEmailVerified) {
            return res
                .status(400)
                .json({ message: 'Please verify your email first.' });
        }
        if (!user.isPhoneVerified) {
            return res
                .status(400)
                .json({ message: 'Please verify your phone number first.' });
        }
        // Checking if 2FA is enabled
        if (user.twoFactorEnabled && user.twoFactorMethod) {
            let otp;
            switch (user.twoFactorMethod) {
                case 'email':
                    otp = yield (0, otpService_1.generateEmailOTP)(user.email);
                    otpRecord.emailOtp = otp;
                    otpRecord.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
                    yield otpRecord.save(); // OTP valid for 10 minutes
                    yield user.save();
                    return res.status(200).json({
                        message: 'Two-factor authentication required. Use email OTP to verify.',
                        method: 'email',
                        userId: user._id,
                    });
                case 'phone':
                    otp = yield (0, otpService_1.generatePhoneOTP)(user.countryCode, user.phone);
                    otpRecord.phoneOtp = otp;
                    otpRecord.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
                    yield otpRecord.save();
                    yield user.save();
                    return res.status(200).json({
                        message: 'Two-factor authentication required. Use phone OTP to verify.',
                        method: 'phone',
                        userId: user._id,
                    });
                case 'authenticator':
                    const authSecret = otpRecord.twoFactorSecret || (0, otpService_1.generateAuthenticatorSecret)();
                    if (!otpRecord.twoFactorSecret) {
                        otpRecord.twoFactorSecret = authSecret;
                        yield otpRecord.save();
                        yield user.save();
                    }
                    return res.status(200).json({
                        message: 'Two-factor authentication required. Use authenticator app OTP to verify.',
                        method: 'authenticator',
                        userId: user._id,
                        authSecret,
                    });
                default:
                    return res.status(400).json({ message: 'Invalid 2FA method.' });
            }
        }
        // If 2FA is not enabled, generate JWT token
        const token = (0, generateToken_1.generateToken)(user._id, user.role);
        res.status(200).json({ message: 'SignIn successful.', token });
    }
    catch (error) {
        console.error('Error during signIn:', error);
        res.status(500).json({ message: 'Failed to SignIn.' });
    }
});
exports.signIn = signIn;
