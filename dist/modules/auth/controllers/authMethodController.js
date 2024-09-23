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
const AuthModel_1 = __importDefault(require("../../../models/AuthModel"));
const updateAuthenticationMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, twoFactorMethod, twoFactorEnabled } = req.body;
    const allowedMethods = ['email', 'phone', 'authenticator'];
    if (!userId || !twoFactorMethod || !twoFactorEnabled) {
        return res
            .status(400)
            .json({ message: 'User ID and Two-Factor Method are required.' });
    }
    if (!allowedMethods.includes(twoFactorMethod)) {
        return res.status(400).json({
            message: `Invalid Two-Factor Method. Allowed methods are: ${allowedMethods.join(', ')}.`,
        });
    }
    try {
        const user = yield AuthModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.twoFactorMethod = twoFactorMethod;
        user.twoFactorEnabled = twoFactorEnabled;
        yield user.save();
        res.status(200).json({
            message: `Authentication method updated successfully to: ${twoFactorMethod}`,
        });
    }
    catch (error) {
        console.error('Error updating authentication method:', error);
        res.status(500).json({
            message: `Failed to update authentication method to: ${twoFactorMethod}`,
        });
    }
});
exports.updateAuthenticationMethod = updateAuthenticationMethod;
