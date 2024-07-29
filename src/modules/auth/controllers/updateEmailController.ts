import { Request, Response } from 'express';
import User from '../../../models/userModel';
import Otp from '../../../models/OtpModel';
import { generateEmailOTP } from '../../../services/otpService';

export const updateEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  const userId = (req as any).userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
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

    otpRecord.tempMail = email;
    otpRecord.isTempMailVerified = false;
    const otp = await generateEmailOTP(email);
    otpRecord.emailOtp = otp;
    otpRecord.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await otpRecord.save();
    await user.save();

    res
      .status(200)
      .json({ message: 'Email updated successfully.Please verify Email.' });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ message: 'Failed to update email.' });
  }
};
