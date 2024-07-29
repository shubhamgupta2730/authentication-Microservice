import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/generateToken';

// Middleware to authenticate the user
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Authorization token missing.' });
    return;
  }

  try {
    const decoded = verifyToken(token) as {
      userId: string;
      role: 'user' | 'seller';
    };
    (req as any).userId = decoded.userId;
    (req as any).role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};
