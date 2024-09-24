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
exports.updateEmail = void 0;
const userModel_1 = __importDefault(require("../../../models/userModel"));
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const otpService_1 = require("../../../services/otpService");
const updateEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const userId = req.userId;
    // Check if email already exists in the User collection
    const existingUser = yield userModel_1.default.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists.' });
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
        otpRecord.tempMail = email;
        otpRecord.isTempMailVerified = false;
        const otp = yield (0, otpService_1.generateEmailOTP)(email);
        otpRecord.emailOtp = otp;
        otpRecord.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        yield otpRecord.save();
        yield user.save();
        res
            .status(200)
            .json({ message: 'Email updated successfully.Please verify Email.' });
    }
    catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ message: 'Failed to update email.' });
    }
});
exports.updateEmail = updateEmail;
