"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OtpSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    emailOtp: {
        type: String,
    },
    emailOtpExpires: {
        type: Date,
    },
    phoneOtp: {
        type: String,
    },
    phoneOtpExpires: {
        type: Date,
    },
    twoFactorSecret: {
        type: String,
    },
    authenticatorSecret: {
        type: String,
    },
    resetToken: {
        type: String,
    },
    resetTokenExpires: {
        type: Date,
    },
    tempMail: {
        type: String,
    },
    tempPhone: {
        type: String,
    },
    tempCountryCode: {
        type: String,
    },
    isTempMailVerified: {
        type: Boolean,
        default: false,
    },
    isTempPhoneVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Otp = (0, mongoose_1.model)('Otp', OtpSchema);
exports.default = Otp;
