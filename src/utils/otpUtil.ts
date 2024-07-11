import crypto from 'crypto';

export const generateOtp = (): string => {
  return crypto.randomBytes(3).toString('hex');
};

export const verifyOtp = (storedOtp: string, providedOtp: string): boolean => {
  return storedOtp === providedOtp;
};
