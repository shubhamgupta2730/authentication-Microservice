import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../../../models/userModel';
import Otp from '../../../models/OtpModel';
import { authenticator } from 'otplib';
import { generateToken } from '../../../utils/generateToken';
import {
  generateEmailOTP,
  generatePhoneOTP,
} from '../../../services/otpService';
import {
  generateTotpSecret,
  generateTotpQrcode,
} from '../../../services/otpService';

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      res.status(403).json({ message: 'You are blocked.' });
      return;
    }

    const otpRecord = await Otp.findOne({ userId: user._id });
    if (!otpRecord) {
      return res.status(404).json({ message: 'OTP record not found.' });
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
          otpRecord.emailOtp = otp;
          otpRecord.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
          await otpRecord.save();
          await user.save();
          return res.status(200).json({
            message: 'Two-factor authentication required. Check Email for OTP.',
            id: otpRecord._id,
          });

        case 'phone':
          otp = await generatePhoneOTP(user.countryCode, user.phone);
          otpRecord.phoneOtp = otp;
          otpRecord.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
          await otpRecord.save();
          await user.save();
          return res.status(200).json({
            message: 'Two-factor authentication required. Check phone for OTP.',
            id: otpRecord._id,
          });

        case 'authenticator':
          let authSecret = otpRecord.twoFactorSecret;
          let qrCodeDataUrl;

          if (!authSecret) {
            const { secret, otpauth } = generateTotpSecret(user.email);
            authSecret = secret;
            otpRecord.twoFactorSecret = authSecret;
            qrCodeDataUrl = await generateTotpQrcode(otpauth);
            await otpRecord.save();
            await user.save();
          } else {
            const otpauth = authenticator.keyuri(
              user.email,
              'Authenticator',
              authSecret
            );
            qrCodeDataUrl = await generateTotpQrcode(otpauth);
          }

          return res.status(200).json({
            message:
              'Two-factor authentication required. Use authenticator app OTP to verify.',
            method: 'authenticator',
            id: otpRecord._id,
            qrCode: qrCodeDataUrl,
          });

        default:
          return res.status(400).json({ message: 'Invalid 2FA method.' });
      }
    }

    // If 2FA is not enabled, generate JWT token
    const token = generateToken(user._id as string, user.role);
    res.status(200).json({ message: 'SignIn successful.', token });
  } catch (error) {
    console.error('Error during signIn:', error);
    res.status(500).json({ message: 'Failed to SignIn.' });
  }
};
