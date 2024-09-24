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
const userModel_1 = __importDefault(require("../../../models/userModel"));
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const generateToken_1 = require("../../../utils/generateToken");
const otpService_1 = require("../../../services/otpService");
const otpService_2 = require("../../../services/otpService");
const verifyOTPController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, otp, authMethod } = req.body;
    // Validate id
    if (!id) {
        return res.status(400).json({
            message: 'Id is required for OTP verification.',
        });
    }
    // Validate otp
    if (!otp && authMethod !== 'authenticator') {
        return res.status(400).json({
            message: 'OTP is required for verification.',
        });
    }
    // Validate authMethod
    const validAuthMethods = ['email', 'phone', 'authenticator'];
    if (!authMethod || !validAuthMethods.includes(authMethod)) {
        return res.status(400).json({
            message: 'Valid authMethod is required for OTP verification. Valid options are: email, phone, authenticator.',
        });
    }
    try {
        const otpRecord = yield OtpModel_1.default.findById(id);
        if (!otpRecord) {
            return res.status(404).json({ message: 'OTP record not found.' });
        }
        const userId = otpRecord.userId;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        let isVerified = false;
        let message = '';
        let token;
        switch (authMethod) {
            case 'email':
                // Check if OTP has expired
                if (otpRecord.emailOtpExpires &&
                    otpRecord.emailOtpExpires < new Date()) {
                    otpRecord.emailOtp = undefined;
                    otpRecord.emailOtpExpires = undefined;
                    yield otpRecord.save();
                    return res.status(400).json({ message: 'Email OTP has expired.' });
                }
                isVerified = yield (0, otpService_2.verifyEmailOTP)(user.email, otp);
                message = 'Email OTP';
                break;
            case 'phone':
                // Check if OTP has expired
                if (otpRecord.phoneOtpExpires &&
                    otpRecord.phoneOtpExpires < new Date()) {
                    otpRecord.phoneOtp = undefined;
                    otpRecord.phoneOtpExpires = undefined;
                    yield otpRecord.save();
                    return res.status(400).json({ message: 'Phone OTP has expired.' });
                }
                isVerified = yield (0, otpService_2.verifyPhoneOTP)(user.phone, otp);
                message = 'Phone OTP';
                break;
            case 'authenticator':
                // Check if the user has a TOTP secret, if not generate one
                if (!otpRecord.twoFactorSecret) {
                    const { secret, otpauth } = (0, otpService_1.generateTotpSecret)(user.email);
                    otpRecord.twoFactorSecret = secret;
                    yield otpRecord.save();
                    const qrCodeDataUrl = yield (0, otpService_1.generateTotpQrcode)(otpauth);
                    return res.status(200).json({
                        message: 'Authenticator QR code generated successfully',
                        qrCode: qrCodeDataUrl,
                    });
                }
                // Verify the TOTP token
                isVerified = (0, otpService_1.verifyTotpToken)(otp, otpRecord.twoFactorSecret);
                message = 'Authenticator App OTP';
                break;
            default:
                return res.status(400).json({ message: 'Invalid auth method.' });
        }
        if (!isVerified) {
            return res
                .status(400)
                .json({ message: `Invalid ${message} or credentials.` });
        }
        // Remove OTP from database based on verification type
        if (authMethod === 'email') {
            otpRecord.emailOtp = undefined;
            otpRecord.emailOtpExpires = undefined;
            user.isEmailVerified = true;
        }
        else if (authMethod === 'phone') {
            otpRecord.phoneOtp = undefined;
            otpRecord.phoneOtpExpires = undefined;
            user.isPhoneVerified = true;
        }
        yield otpRecord.save();
        yield user.save();
        token = (0, generateToken_1.generateToken)(userId.toString(), user.role);
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
