import { Request, Response } from 'express';
import Auth from '../models/AuthModel';
import {
  verifyEmailOTP,
  verifyPhoneOTP,
  verifyAuthenticatorOTP,
} from '../services/otpService';

export const verifyOTPController = async (req: Request, res: Response) => {
  const { userId, otp, emailOtp, phoneOtp } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: 'Enter all the fields.',
    });
  }

  try {
    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let isVerified = false;
    let message = '';
    let type: string | undefined = '';

    if (emailOtp) {
      isVerified = await verifyEmailOTP(user.email, emailOtp);
      message = 'Email OTP';
      type = 'email';
    } else if (phoneOtp) {
      isVerified = await verifyPhoneOTP(user.phone, phoneOtp);
      message = 'Phone OTP';
      type = 'phone';
    } else {
      type = user.twoFactorMethod;
      switch (type) {
        case 'email':
          isVerified = await verifyEmailOTP(user.email, otp);
          message = 'Email OTP';
          break;
        case 'phone':
          isVerified = await verifyPhoneOTP(user.phone, otp);
          message = 'Phone OTP';
          break;
        case 'authenticator':
          if (!user.twoFactorSecret) {
            return res.status(400).json({
              message: 'User does not have an authenticator secret set up.',
            });
          }
          isVerified = verifyAuthenticatorOTP(otp, user.twoFactorSecret);
          message = 'Authenticator App OTP';
          break;
        default:
          return res
            .status(400)
            .json({ message: 'Invalid OTP verification type.' });
      }
    }

    if (!isVerified) {
      return res
        .status(400)
        .json({ message: `Invalid ${message} or credentials.` });
    }

    // Remove OTP from database based on verification type
    if (type === 'email') {
      user.emailOtp = undefined;
      user.emailOtpExpires = undefined;
      user.isEmailVerified = true;
    } else if (type === 'phone') {
      user.phoneOtp = undefined;
      user.phoneOtpExpires = undefined;
      user.isPhoneVerified = true;
    } else if (type === 'authenticator') {
      user.isAuthenticatorVerified = true;
    }

    await user.save();

    res.status(200).json({ message: `${message} verified successfully.` });
  } catch (error) {
    console.error(`Error verifying OTP:`, error);
    res.status(500).json({ message: `Failed to verify OTP.` });
  }
};
