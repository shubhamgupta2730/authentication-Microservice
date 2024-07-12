import crypto from 'crypto';
import { totp, authenticator } from 'otplib';
import qrcode from 'qrcode'; 

// Generate a regular OTP
export const generateOtp = (): string => {
  return crypto.randomBytes(3).toString('hex');
};

// Verify a regular OTP
export const verifyOtp = (storedOtp: string, providedOtp: string): boolean => {
  return storedOtp === providedOtp;
};

// Generate TOTP secret and otpauth URL
export const generateTotpSecret = (email: string) => {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, 'appName', secret);
  return { secret, otpauth };
};

// Generate QR code for TOTP secret
export const generateTotpQrcode = async (otpauth: string) => {
  try {
    const qrCodeDataUrl = await qrcode.toDataURL(otpauth);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error('Error generating QR code');
  }
};

// Verify TOTP token
export const verifyTotpToken = (token: string, secret: string) => {
  return totp.verify({ token, secret });
};
