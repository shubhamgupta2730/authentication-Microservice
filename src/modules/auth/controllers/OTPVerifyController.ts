import { Request, Response } from 'express';
import User from '../../../models/userModel';
import Otp from '../../../models/OtpModel';
import { generateToken } from '../../../utils/generateToken';
import {
  verifyEmailOTP,
  verifyPhoneOTP,
  verifyAuthenticatorOTP,
} from '../../../services/otpService';

export const verifyOTPController = async (req: Request, res: Response) => {
  const { id, otp, authMethod } = req.body;

  // Validate id
  if (!id) {
    return res.status(400).json({
      message: 'Id is required for OTP verification.',
    });
  }

  // Validate otp
  if (!otp) {
    return res.status(400).json({
      message: 'OTP is required for verification.',
    });
  }

  // Validate authMethod
  const validAuthMethods = ['email', 'phone', 'authenticator'];
  if (!authMethod || !validAuthMethods.includes(authMethod)) {
    return res.status(400).json({
      message:
        'Valid authMethod is required for OTP verification. Valid options are: email, phone, authenticator.',
    });
  }

  try {
    const otpRecord = await Otp.findById(id);
    if (!otpRecord) {
      return res.status(404).json({ message: 'OTP record not found.' });
    }

    const userId = otpRecord.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let isVerified = false;
    let message = '';
    let token: string | undefined;

    switch (authMethod) {
      case 'email':
        isVerified = await verifyEmailOTP(user.email, otp);
        message = 'Email OTP';
        break;
      case 'phone':
        isVerified = await verifyPhoneOTP(user.phone, otp);
        message = 'Phone OTP';
        break;
      case 'authenticator':
        if (!otpRecord.twoFactorSecret) {
          return res.status(400).json({
            message: 'User does not have an authenticator secret set up.',
          });
        }
        isVerified = verifyAuthenticatorOTP(otp, otpRecord.twoFactorSecret);
        message = 'Authenticator App OTP';
        break;
      default:
        return res.status(400).json({ message: 'Invalid auth method.' });
    }

    if (!isVerified) {
      return res
        .status(400)
        .json({ message: `Invalid ${message} or credentials.` });
    }

    // Remove OTP from database based on verification type
    if (authMethod === 'email') {
      otpRecord.emailOtp = undefined;
      otpRecord.emailOtpExpires = undefined;
      user.isEmailVerified = true;
    } else if (authMethod === 'phone') {
      otpRecord.phoneOtp = undefined;
      otpRecord.phoneOtpExpires = undefined;
      user.isPhoneVerified = true;
    }

    await otpRecord.save();
    await user.save();

    token = generateToken(userId.toString(), user.role);

    res
      .status(200)
      .json({ message: `${message} verified successfully.`, token });
  } catch (error) {
    console.error(`Error verifying OTP:`, error);
    res.status(500).json({ message: `Failed to verify OTP.` });
  }
};
