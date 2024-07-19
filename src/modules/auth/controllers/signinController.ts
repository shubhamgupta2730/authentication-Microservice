import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Auth from '../../../models/AuthModel';
import {
  generateEmailOTP,
  generatePhoneOTP,
  generateAuthenticatorSecret,
} from '../../../services/otpService';

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Email and password are required.' });
  }

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: 'Please verify your email first.' });
    }

    if (!user.isPhoneVerified) {
      return res
        .status(400)
        .json({ message: 'Please verify your phone number first.' });
    }

    // Checking if 2FA is enabled
    if (user.twoFactorEnabled && user.twoFactorMethod) {
      let otp: string;
      switch (user.twoFactorMethod) {
        case 'email':
          otp = await generateEmailOTP(user.email);
          user.emailOtp = otp;
          user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
          await user.save();
          return res.status(200).json({
            message:
              'Two-factor authentication required. Use email OTP to verify.',
            method: 'email',
            userId: user._id,
          });

        case 'phone':
          otp = await generatePhoneOTP(user.countryCode, user.phone);
          user.phoneOtp = otp;
          user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
          await user.save();
          return res.status(200).json({
            message:
              'Two-factor authentication required. Use phone OTP to verify.',
            method: 'phone',
            userId: user._id,
          });

        case 'authenticator':
          const authSecret =
            user.twoFactorSecret || generateAuthenticatorSecret();
          if (!user.twoFactorSecret) {
            user.twoFactorSecret = authSecret;
            await user.save();
          }
          return res.status(200).json({
            message:
              'Two-factor authentication required. Use authenticator app OTP to verify.',
            method: 'authenticator',
            userId: user._id,
            authSecret,
          });

        default:
          return res.status(400).json({ message: 'Invalid 2FA method.' });
      }
    }

    // If 2FA is not enabled, generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '', {
      expiresIn: '1h',
    });
    res.status(200).json({ message: 'SignIn successful.', token });
  } catch (error) {
    console.error('Error during signIn:', error);
    res.status(500).json({ message: 'Failed to SignIn.' });
  }
};
