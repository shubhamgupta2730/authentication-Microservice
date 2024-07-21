import { Request, Response } from 'express';
import Auth from '../../../models/AuthModel';
import Otp from '../../../models/OtpModel';
import { generatePhoneOTP } from '../../../services/otpService';

export const updatePhoneNumber = async (req: Request, res: Response) => {
  const { phone, countryCode } = req.body;
  const userId = (req as any).userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  if (!phone || !countryCode) {
    return res
      .status(400)
      .json({ message: 'Phone and country code are required.' });
  }

  try {
    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const otpRecord = await Otp.findOne({ authId: user._id });
    if (!otpRecord) {
      return res.status(404).json({ message: 'otp record not found.' });
    }

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ message: 'Invalid phone number.' });
    }

    otpRecord.tempPhone = phone;
    otpRecord.isTempPhoneVerified = false;
    user.countryCode = countryCode;
    const otp = await generatePhoneOTP(user.countryCode, otpRecord.tempPhone);
    otpRecord.phoneOtp = otp;
    otpRecord.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await otpRecord.save();
    await user.save();
    // await verifyPhoneOTP(phone, otp);

    res.status(200).json({
      message:
        'Phone number updated Request successful.Please verify Phone number.',
    });
  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ message: 'Failed to update phone number.' });
  }
};
