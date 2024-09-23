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
const AuthModel_1 = __importDefault(require("../../../models/AuthModel"));
// import User, { IUser } from '../../../models/userModel';
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const otpService_1 = require("../../../services/otpService");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, countryCode, phone, role } = req.body;
    try {
        if (!email || !password || !phone || !countryCode || !role) {
            return res.status(400).send({ message: 'All fields are required.' });
        }
        const existingUser = yield AuthModel_1.default.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res
                .status(400)
                .send({ message: 'Email or phone already in use.' });
        }
        if (!['user', 'seller'].includes(role)) {
            return res.status(400).send({ message: 'Invalid role.' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Generate OTP
        const emailOtp = yield (0, otpService_1.generateEmailOTP)(email);
        const phoneOtp = yield (0, otpService_1.generatePhoneOTP)(countryCode, phone);
        const newAuth = new AuthModel_1.default({
            email,
            password: hashedPassword,
            phone,
            countryCode,
            role,
        });
        yield newAuth.save();
        // const newUser: IUser = new User({
        //   authId: newAuth._id,
        //   firstName,
        //   lastName,
        //   gender,
        //   dob,
        // });
        // await newUser.save();
        const newOtp = new OtpModel_1.default({
            authId: newAuth._id,
            emailOtp,
            phoneOtp,
            emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
            phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
        });
        yield newOtp.save();
        res.status(201).json({
            userId: newAuth._id,
            message: 'Signup request successful. Please verify the Email and Phone Number.',
        });
    }
    catch (error) {
        console.error('Error in Signup:', error);
        res.status(500).send({ message: 'Failed to Signup.' });
    }
});
exports.signup = signup;
