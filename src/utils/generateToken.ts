import jwt, { Secret } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables.');
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET as Secret, { expiresIn: '1h' });
};

export const verifyToken = (token: string): string | object => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as Secret);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};