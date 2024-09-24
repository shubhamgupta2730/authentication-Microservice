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
const userModel_1 = __importDefault(require("../../../models/userModel"));
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const otplib_1 = require("otplib");
const generateToken_1 = require("../../../utils/generateToken");
const otpService_1 = require("../../../services/otpService");
const otpService_2 = require("../../../services/otpService");
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!password) {
        return res.status(400).json({ message: 'Password is required.' });
    }
    try {
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Check if the user is blocked
        if (user.isBlocked) {
            res.status(403).json({ message: 'You are blocked.' });
            return;
        }
        const otpRecord = yield OtpModel_1.default.findOne({ userId: user._id });
        if (!otpRecord) {
            return res.status(404).json({ message: 'OTP record not found.' });
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
                    otpRecord.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
                    yield otpRecord.save();
                    yield user.save();
                    return res.status(200).json({
                        message: 'Two-factor authentication required. Check Email for OTP.',
                        id: otpRecord._id,
                    });
                case 'phone':
                    otp = yield (0, otpService_1.generatePhoneOTP)(user.countryCode, user.phone);
                    otpRecord.phoneOtp = otp;
                    otpRecord.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
                    yield otpRecord.save();
                    yield user.save();
                    return res.status(200).json({
                        message: 'Two-factor authentication required. Check phone for OTP.',
                        id: otpRecord._id,
                    });
                case 'authenticator':
                    let authSecret = otpRecord.twoFactorSecret;
                    let qrCodeDataUrl;
                    if (!authSecret) {
                        const { secret, otpauth } = (0, otpService_2.generateTotpSecret)(user.email);
                        authSecret = secret;
                        otpRecord.twoFactorSecret = authSecret;
                        qrCodeDataUrl = yield (0, otpService_2.generateTotpQrcode)(otpauth);
                        yield otpRecord.save();
                        yield user.save();
                    }
                    else {
                        const otpauth = otplib_1.authenticator.keyuri(user.email, 'Authenticator', authSecret);
                        qrCodeDataUrl = yield (0, otpService_2.generateTotpQrcode)(otpauth);
                    }
                    return res.status(200).json({
                        message: 'Two-factor authentication required. Use authenticator app OTP to verify.',
                        method: 'authenticator',
                        id: otpRecord._id,
                        qrCode: qrCodeDataUrl,
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
