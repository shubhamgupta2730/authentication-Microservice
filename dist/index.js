"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const logger_1 = require("./logger");
const authRoute_1 = __importDefault(require("./modules/auth/routes/authRoute"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect to database
(0, db_1.default)();
// Middleware
app.use(express_1.default.json());
//Routes:
app.use('/api/v1/auth', authRoute_1.default);
app.listen(PORT, () => {
    logger_1.logger.info(`Server is running on http://localhost:${PORT}`);
});
