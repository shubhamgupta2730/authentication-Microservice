import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/generateToken';

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
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};