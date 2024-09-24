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
exports.updateAuthenticationMethod = void 0;
const userModel_1 = __importDefault(require("../../../models/userModel"));
const OtpModel_1 = __importDefault(require("../../../models/OtpModel"));
const updateAuthenticationMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, twoFactorMethod, twoFactorEnabled } = req.body;
    const allowedMethods = ['email', 'phone', 'authenticator'];
    if (!id || !twoFactorMethod || !twoFactorEnabled) {
        return res
            .status(400)
            .json({ message: 'ID and Two-Factor Method are required.' });
    }
    if (!allowedMethods.includes(twoFactorMethod)) {
        return res.status(400).json({
            message: `Invalid Two-Factor Method. Allowed methods are: ${allowedMethods.join(', ')}.`,
        });
    }
    try {
        const otpRecord = yield OtpModel_1.default.findById(id);
        if (!otpRecord) {
            return res.status(401).json({
                message: 'user not found',
            });
        }
        const user = yield userModel_1.default.findOne(otpRecord.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.twoFactorMethod = twoFactorMethod;
        user.twoFactorEnabled = twoFactorEnabled;
        yield user.save();
        if (twoFactorEnabled == 'true') {
            res.status(200).json({
                message: `Authentication method updated successfully to: ${twoFactorMethod}`,
            });
        }
        else {
            res.status(200).json({
                message: `Authentication Method is Disabled.`,
            });
        }
    }
    catch (error) {
        console.error('Error updating authentication method:', error);
        res.status(500).json({
            message: `Failed to update authentication method to: ${twoFactorMethod}`,
        });
    }
});
exports.updateAuthenticationMethod = updateAuthenticationMethod;
