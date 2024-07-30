import { Request, Response } from 'express';
import User from '../../../models/userModel';
import Otp from '../../../models/OtpModel';
import { generatePhoneOTP } from '../../../services/otpService';

export const updatePhoneNumber = async (req: Request, res: Response) => {
  const { phone, countryCode } = req.body;
  const userId = (req as any).userId;

  // Check if email already exists in the User collection
  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(400).json({ message: 'Phone number already exists.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const otpRecord = await Otp.findOne({ userId: user._id });
    if (!otpRecord) {
      return res.status(404).json({ message: 'otp record not found.' });
    }

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ message: 'Invalid phone number.' });
    }

    otpRecord.tempPhone = phone;
    otpRecord.isTempPhoneVerified = false;
    otpRecord.tempCountryCode = countryCode;
    const otp = await generatePhoneOTP(
      otpRecord.tempCountryCode as string,
      otpRecord.tempPhone as string
    );
    otpRecord.phoneOtp = otp;
    otpRecord.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await otpRecord.save();
    await user.save();
    res.status(200).json({
      message:
        'Phone number update Request successful.Please verify Phone number.',
    });
  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ message: 'Failed to update phone number.' });
  }
};
