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
exports.updatePhoneNumber = void 0;
const userModel_1 = __importDefault(require("../../../models/userModel"));
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const otpService_1 = require("../../../services/otpService");
const updatePhoneNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, countryCode } = req.body;
    const userId = req.userId;
    // Check if email already exists in the User collection
    const existingUser = yield userModel_1.default.findOne({ phone });
    if (existingUser) {
        return res.status(400).json({ message: 'Phone number already exists.' });
    }
    try {
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const otpRecord = yield OtpModel_1.default.findOne({ userId: user._id });
        if (!otpRecord) {
            return res.status(404).json({ message: 'otp record not found.' });
        }
        if (!phone || typeof phone !== 'string') {
            return res.status(400).json({ message: 'Invalid phone number.' });
        }
        otpRecord.tempPhone = phone;
        otpRecord.isTempPhoneVerified = false;
        otpRecord.tempCountryCode = countryCode;
        const otp = yield (0, otpService_1.generatePhoneOTP)(otpRecord.tempCountryCode, otpRecord.tempPhone);
        otpRecord.phoneOtp = otp;
        otpRecord.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        yield otpRecord.save();
        yield user.save();
        res.status(200).json({
            message: 'Phone number update Request successful.Please verify Phone number.',
        });
    }
    catch (error) {
        console.error('Error updating phone number:', error);
        res.status(500).json({ message: 'Failed to update phone number.' });
    }
});
exports.updatePhoneNumber = updatePhoneNumber;
