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
exports.verifyTotpToken = exports.verifyPhoneOTP = exports.verifyEmailOTP = exports.generateTotpQrcode = exports.generateTotpSecret = exports.generatePhoneOTP = exports.generateEmailOTP = exports.sendResetPasswordLinkToMail = exports.generateOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
const userModel_1 = __importDefault(require("../models/userModel"));
const OtpModel_1 = __importDefault(require("../models/OtpModel"));
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID || '', process.env.TWILIO_AUTH_TOKEN || '');
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
    },
});
//! generate otp function:
const generateOTP = (length) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};
exports.generateOTP = generateOTP;
//*--------------------Generate OTP-------------------------//
//! sending  reset password link to mail:
const sendResetPasswordLinkToMail = (email, text, subject) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: process.env.EMAIL_USER || '',
        to: email,
        subject: subject,
        text: text,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendResetPasswordLinkToMail = sendResetPasswordLinkToMail;
//! Generate and send OTP via email:
const generateEmailOTP = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = (0, exports.generateOTP)(6);
    const mailOptions = {
        from: process.env.EMAIL_USER || '',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for email verification is ${otp}`,
    };
    yield transporter.sendMail(mailOptions);
    return otp;
});
exports.generateEmailOTP = generateEmailOTP;
//! Generate and send OTP via phone:
const generatePhoneOTP = (countryCode, to) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = (0, exports.generateOTP)(6);
    const formattedPhone = `${countryCode}${to}`;
    try {
        yield twilioClient.messages.create({
            body: `Your OTP for phone verification is ${otp}`,
            to: formattedPhone,
            from: process.env.TWILIO_PHONE_NUMBER || '',
        });
        return otp;
    }
    catch (error) {
        console.error('Error sending OTP via Twilio:', error);
        throw error;
    }
});
exports.generatePhoneOTP = generatePhoneOTP;
//!  Generate base32 encoded secret for authenticator app
// export const generateAuthenticatorSecret = (): string => {
//   const secret = speakeasy.generateSecret({ length: 20 });
//   return secret.base32;
// };
// Generate TOTP secret and otpauth URL
const generateTotpSecret = (email) => {
    const secret = otplib_1.authenticator.generateSecret();
    const otpauth = otplib_1.authenticator.keyuri(email, 'Authenticator', secret);
    return { secret, otpauth };
};
exports.generateTotpSecret = generateTotpSecret;
// Generate QR code for TOTP secret
const generateTotpQrcode = (otpauth) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const qrCodeDataUrl = yield qrcode_1.default.toDataURL(otpauth);
        return qrCodeDataUrl;
    }
    catch (error) {
        throw new Error('Error generating QR code');
    }
});
exports.generateTotpQrcode = generateTotpQrcode;
//*--------------------Verify OTP--------------------------------------//
//! Verify OTP for email verification
const verifyEmailOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            return false;
        }
        const otpRecord = yield OtpModel_1.default.findOne({ userId: user._id });
        if (!otpRecord) {
            return false;
        }
        if (otp !== otpRecord.emailOtp) {
            return false;
        }
        // Update email verification status
        otpRecord.isTempMailVerified = true;
        user.isEmailVerified = true;
        if (otpRecord.tempMail && otpRecord.isTempMailVerified) {
            user.email = otpRecord.tempMail;
            otpRecord.tempMail = undefined;
        }
        otpRecord.emailOtp = undefined;
        yield otpRecord.save();
        yield user.save();
        return true;
    }
    catch (error) {
        console.error('Error verifying email OTP:', error);
        return false;
    }
});
exports.verifyEmailOTP = verifyEmailOTP;
//! Verify OTP for phone verification
const verifyPhoneOTP = (phone, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findOne({ phone });
        if (!user) {
            return false;
        }
        const otpRecord = yield OtpModel_1.default.findOne({ userId: user._id });
        if (!otpRecord) {
            return false;
        }
        if (otp !== otpRecord.phoneOtp) {
            return false;
        }
        user.isPhoneVerified = true;
        otpRecord.isTempPhoneVerified = true;
        if (otpRecord.tempPhone &&
            otpRecord.isTempPhoneVerified &&
            otpRecord.tempCountryCode) {
            user.phone = otpRecord.tempPhone;
            user.countryCode = otpRecord.tempCountryCode;
            otpRecord.tempPhone = undefined;
            otpRecord.tempCountryCode = undefined;
        }
        otpRecord.phoneOtp = undefined;
        yield otpRecord.save();
        yield user.save();
        return true;
    }
    catch (error) {
        console.error('Error verifying phone OTP:', error);
        return false;
    }
});
exports.verifyPhoneOTP = verifyPhoneOTP;
//! Verify OTP for authenticator app
// Verify TOTP token
const verifyTotpToken = (token, secret) => {
    return otplib_1.authenticator.check(token, secret);
};
exports.verifyTotpToken = verifyTotpToken;
