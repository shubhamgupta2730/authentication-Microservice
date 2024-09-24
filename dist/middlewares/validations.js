"use strict";
// validators.js
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
exports.validateFirstName = exports.validateRole = exports.validateCountryCode = exports.validatePhone = exports.validateDob = exports.validateGender = exports.validateAddress = exports.validateEmail = exports.validateUserId = exports.checkExistingUserByPhone = exports.checkExistingUserByEmail = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
// Middleware to check for existing user by email
const checkExistingUserByEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .send({ message: 'User with the provided email already exists.' });
        }
        next();
    }
    catch (error) {
        console.error('Error checking existing user by email:', error);
        return res.status(500).send({ message: 'Internal server error.' });
    }
});
exports.checkExistingUserByEmail = checkExistingUserByEmail;
// Middleware to check for existing user by phone
const checkExistingUserByPhone = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone } = req.body;
    try {
        const existingUser = yield userModel_1.default.findOne({ phone });
        if (existingUser) {
            return res
                .status(400)
                .send({ message: 'User with the provided phone already exists.' });
        }
        next();
    }
    catch (error) {
        console.error('Error checking existing user by phone:', error);
        return res.status(500).send({ message: 'Internal server error.' });
    }
});
exports.checkExistingUserByPhone = checkExistingUserByPhone;
// Validation function for user ID
const validateUserId = (req, res, next) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    next();
};
exports.validateUserId = validateUserId;
// Validation function for email
const validateEmail = (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }
    next();
};
exports.validateEmail = validateEmail;
// Validation function for address
const validateAddress = (req, res, next) => {
    const { address } = req.body;
    if (!address || typeof address !== 'object') {
        return res.status(400).send({ message: 'Address is required.' });
    }
    const { addressLine1, addressLine2, street, city, state, postalCode, country, } = address;
    if (!addressLine1 ||
        typeof addressLine1 !== 'string' ||
        addressLine1.length < 5 ||
        addressLine1.length > 200) {
        return res.status(400).send({
            message: 'Invalid address line 1. Must be between 5 and 200 characters.',
        });
    }
    if (addressLine2 &&
        (typeof addressLine2 !== 'string' || addressLine2.length > 200)) {
        return res.status(400).send({
            message: 'Invalid address line 2. Must be at most 200 characters.',
        });
    }
    if (!street ||
        typeof street !== 'string' ||
        street.length < 5 ||
        street.length > 100) {
        return res.status(400).send({
            message: 'Invalid street. Must be between 5 and 100 characters.',
        });
    }
    if (!city ||
        typeof city !== 'string' ||
        city.length < 2 ||
        city.length > 50) {
        return res
            .status(400)
            .send({ message: 'Invalid city. Must be between 2 and 50 characters.' });
    }
    if (!state ||
        typeof state !== 'string' ||
        state.length < 2 ||
        state.length > 50) {
        return res
            .status(400)
            .send({ message: 'Invalid state. Must be between 2 and 50 characters.' });
    }
    const postalCodeRegex = /^\d{4,8}$/;
    if (!postalCode ||
        typeof postalCode !== 'string' ||
        !postalCodeRegex.test(postalCode)) {
        return res.status(400).send({
            message: 'Invalid postal code. Must be between 4 and 8 digits.',
        });
    }
    if (!country ||
        typeof country !== 'string' ||
        country.length < 2 ||
        country.length > 50) {
        return res.status(400).send({
            message: 'Invalid country. Must be between 2 and 50 characters.',
        });
    }
    next();
};
exports.validateAddress = validateAddress;
// Validation function for gender
const validateGender = (req, res, next) => {
    const { gender } = req.body;
    if (!['male', 'female', 'other'].includes(gender)) {
        return res.status(400).send({ message: 'Invalid gender.' });
    }
    next();
};
exports.validateGender = validateGender;
// Validation function for date of birth
const validateDob = (req, res, next) => {
    const { dob } = req.body;
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime()) || dobDate >= new Date()) {
        return res.status(400).send({ message: 'Invalid date of birth.' });
    }
    next();
};
exports.validateDob = validateDob;
// Validation function for phone number
const validatePhone = (req, res, next) => {
    const { phone } = req.body;
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone)) {
        return res.status(400).send({
            message: 'Invalid phone number. Must be between 7 and 15 digits.',
        });
    }
    next();
};
exports.validatePhone = validatePhone;
// Validation function for country code
const validateCountryCode = (req, res, next) => {
    const { countryCode } = req.body;
    const countryCodeRegex = /^\+[1-9]{1}[0-9]{1,3}$/;
    if (!countryCode ||
        typeof countryCode !== 'string' ||
        !countryCodeRegex.test(countryCode)) {
        return res.status(400).send({
            message: 'Invalid country code. Must start with a "+" followed by 1-4 digits.',
        });
    }
    next();
};
exports.validateCountryCode = validateCountryCode;
// Validation function for role
const validateRole = (req, res, next) => {
    const { role } = req.body;
    if (!['user', 'seller'].includes(role)) {
        return res.status(400).send({ message: 'Invalid role.' });
    }
    next();
};
exports.validateRole = validateRole;
// Validation function for first name
const validateFirstName = (req, res, next) => {
    const { firstName } = req.body;
    const alphaRegex = /^[A-Za-z]+$/;
    if (!firstName ||
        typeof firstName !== 'string' ||
        firstName.length < 1 ||
        firstName.length > 50 ||
        !alphaRegex.test(firstName)) {
        return res.status(400).json({
            message: 'First name is required, must be between 1 and 50 characters, and contain only alphabetic characters.',
        });
    }
    next();
};
exports.validateFirstName = validateFirstName;
