"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const generateToken_1 = require("../utils/generateToken");
// Middleware to authenticate the user
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ message: 'Authorization token missing.' });
        return;
    }
    try {
        const decoded = (0, generateToken_1.verifyToken)(token);
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};
exports.authMiddleware = authMiddleware;
