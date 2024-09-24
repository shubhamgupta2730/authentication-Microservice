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
exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../../../models/userModel"));
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const otpService_1 = require("../../../services/otpService");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, countryCode, phone, role, firstName, lastName, dob, gender, } = req.body;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Generate OTP
        const emailOtp = yield (0, otpService_1.generateEmailOTP)(email);
        const phoneOtp = yield (0, otpService_1.generatePhoneOTP)(countryCode, phone);
        const newUser = new userModel_1.default({
            firstName,
            lastName,
            dob,
            gender,
            countryCode,
            phone,
            email,
            password: hashedPassword,
            role,
        });
        yield newUser.save();
        const newOtp = new OtpModel_1.default({
            userId: newUser._id,
            emailOtp,
            phoneOtp,
            emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
            phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
        });
        yield newOtp.save();
        res.status(201).json({
            _id: newOtp._id,
            message: 'Signup request successful.OTP is sent to your Phone and email address. Please verify the Email and Phone Number.',
        });
    }
    catch (error) {
        console.error('Error in Signup:', error);
        res.status(500).send({ message: 'Failed to Signup.' });
    }
});
exports.signup = signup;
