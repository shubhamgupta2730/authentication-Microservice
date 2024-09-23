"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AuthSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    countryCode: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorMethod: {
        type: String,
        enum: ['email', 'phone', 'authenticator'],
    },
    role: {
        type: String,
        enum: ['user', 'seller'],
        required: true,
        default: 'user',
    },
}, {
    timestamps: true,
});
const Auth = (0, mongoose_1.model)('Auth', AuthSchema);
exports.default = Auth;
