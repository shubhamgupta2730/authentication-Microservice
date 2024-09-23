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
exports.viewProfile = void 0;
const userModel_1 = __importDefault(require("../../../models/userModel"));
const AuthModel_1 = __importDefault(require("../../../models/AuthModel"));
const viewProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const userProfile = yield userModel_1.default.findOne({ authId: userId });
        if (!userProfile) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const authProfile = yield AuthModel_1.default.findOne({
            _id: userProfile.authId,
        });
        if (!authProfile) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const user = {
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: authProfile.email,
            phone: authProfile.phone,
            countrycode: authProfile.countryCode,
            dob: userProfile.dob,
            gender: userProfile.gender,
        };
        res.status(200).json({ user });
    }
    catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ message: 'Failed to get profile.' });
    }
});
exports.viewProfile = viewProfile;
