import { Request, Response } from 'express';
import User from '../../../models/userModel';
import Otp from '../../../models/OtpModel';
import { generateToken } from '../../../utils/generateToken';
import {
  generateTotpSecret,
  generateTotpQrcode,
  verifyTotpToken,
} from '../../../services/otpService';
import { verifyEmailOTP, verifyPhoneOTP } from '../../../services/otpService';

export const verifyOTPController = async (req: Request, res: Response) => {
  const { id, otp, authMethod } = req.body;

  // Validate id
  if (!id) {
    return res.status(400).json({
      message: 'Id is required for OTP verification.',
    });
  }

  // Validate otp
  if (!otp && authMethod !== 'authenticator') {
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
        // Check if OTP has expired
        if (
          otpRecord.emailOtpExpires &&
          otpRecord.emailOtpExpires < new Date()
        ) {
          otpRecord.emailOtp = undefined;
          otpRecord.emailOtpExpires = undefined;
          await otpRecord.save();
          return res.status(400).json({ message: 'Email OTP has expired.' });
        }

        isVerified = await verifyEmailOTP(user.email, otp);
        message = 'Email OTP';
        break;
      case 'phone':
        // Check if OTP has expired
        if (
          otpRecord.phoneOtpExpires &&
          otpRecord.phoneOtpExpires < new Date()
        ) {
          otpRecord.phoneOtp = undefined;
          otpRecord.phoneOtpExpires = undefined;
          await otpRecord.save();
          return res.status(400).json({ message: 'Phone OTP has expired.' });
        }

        isVerified = await verifyPhoneOTP(user.phone, otp);
        message = 'Phone OTP';
        break;
      case 'authenticator':
        // Check if the user has a TOTP secret, if not generate one
        if (!otpRecord.twoFactorSecret) {
          const { secret, otpauth } = generateTotpSecret(user.email);
          otpRecord.twoFactorSecret = secret;
          await otpRecord.save();

          const qrCodeDataUrl = await generateTotpQrcode(otpauth);
          return res.status(200).json({
            message: 'Authenticator QR code generated successfully',
            qrCode: qrCodeDataUrl,
          });
        }

        // Verify the TOTP token
        isVerified = verifyTotpToken(otp, otpRecord.twoFactorSecret);
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
