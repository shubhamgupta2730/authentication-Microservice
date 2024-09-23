"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    authId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
    },
    gender: {
        type: String,
    },
}, {
    timestamps: true,
});
const User = (0, mongoose_1.model)('User', UserSchema);
exports.default = User;
