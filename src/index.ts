import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { logger } from './logger';
import morgan from 'morgan'
import requestLogger from './middlewares/requestLogger';
import authRoutes from './modules/auth/routes/authRoute';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Define the stream object with the expected write function
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Connect to database
connectDB();

// Middleware
app.use(express.json());


// Skip logging during tests
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

// Use morgan middleware for logging HTTP requests
app.use(morgan('combined', { stream, skip }));
app.use(requestLogger);

//Routes:
app.use('/api/v1/auth', authRoutes);

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
