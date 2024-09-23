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
exports.updateProfile = void 0;
const userModel_1 = __importDefault(require("../../../models/userModel"));
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { firstName, lastName, dob, gender } = req.body;
    try {
        const userProfile = yield userModel_1.default.findOneAndUpdate({ authId: userId }, { firstName, lastName, dob, gender }, { new: true, runValidators: true, upsert: true });
        if (!['male', 'female', 'other'].includes(gender)) {
            return res.status(400).send({ message: 'Invalid gender.' });
        }
        const dobDate = new Date(dob);
        if (isNaN(dobDate.getTime()) || dobDate >= new Date()) {
            return res.status(400).send({ message: 'Invalid date of birth.' });
        }
        const user = {
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            dob: userProfile.dob,
            gender: userProfile.gender,
        };
        res.status(200).json({ user });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
});
exports.updateProfile = updateProfile;
