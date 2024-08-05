import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/generateToken';
import User from '../models/userModel'; 

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    // Fetch the user 
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: 'User not found.' });
      return;
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      res.status(403).json({ message: 'You are blocked.' });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};
