import { Request, Response } from 'express';
import Auth from '../../../models/AuthModel';
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

  try {
    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.tempMail = email;
    user.isTempMailVerified = false;
    const otp = await generateEmailOTP(email);
    user.emailOtp = otp;
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    res
      .status(200)
      .json({ message: 'Email updated successfully.Please verify Email.' });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ message: 'Failed to update email.' });
  }
};
