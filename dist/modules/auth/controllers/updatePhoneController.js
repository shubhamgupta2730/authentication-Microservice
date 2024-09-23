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
const AuthModel_1 = __importDefault(require("../../../models/AuthModel"));
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const otpService_1 = require("../../../services/otpService");
const updatePhoneNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, countryCode } = req.body;
    const userId = req.userId;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    if (!phone || !countryCode) {
        return res
            .status(400)
            .json({ message: 'Phone and country code are required.' });
    }
    try {
        const user = yield AuthModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const otpRecord = yield OtpModel_1.default.findOne({ authId: user._id });
        if (!otpRecord) {
            return res.status(404).json({ message: 'otp record not found.' });
        }
        if (!phone || typeof phone !== 'string') {
            return res.status(400).json({ message: 'Invalid phone number.' });
        }
        otpRecord.tempPhone = phone;
        otpRecord.isTempPhoneVerified = false;
        user.countryCode = countryCode;
        const otp = yield (0, otpService_1.generatePhoneOTP)(user.countryCode, otpRecord.tempPhone);
        otpRecord.phoneOtp = otp;
        otpRecord.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        yield otpRecord.save();
        yield user.save();
        // await verifyPhoneOTP(phone, otp);
        res.status(200).json({
            message: 'Phone number updated Request successful.Please verify Phone number.',
        });
    }
    catch (error) {
        console.error('Error updating phone number:', error);
        res.status(500).json({ message: 'Failed to update phone number.' });
    }
});
exports.updatePhoneNumber = updatePhoneNumber;
