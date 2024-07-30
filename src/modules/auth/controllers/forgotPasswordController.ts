import { Request, Response } from 'express';
import User from '../../../models/userModel';
import Otp from '../../../models/OtpModel';
import { sendResetPasswordLinkToMail } from '../../../services/otpService';
import crypto from 'crypto';

const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const otpRecord = await Otp.findOne({ userId: user._id });
    if (!otpRecord) {
      return res.status(404).json({ message: 'otp records not found' });
    }

    const resetToken = generateResetToken();
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    otpRecord.resetToken = hashedToken;
    otpRecord.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    otpRecord.save();
    await user.save();

    const resetLink = `http://localhost:3000/api/v1/auth/reset-password?token=${resetToken}`;
    const mailSubject = 'Password Reset Link';
    const mailText = `Click the following link to reset your password for the platform: ${resetLink}`;

    await sendResetPasswordLinkToMail(email, mailText, mailSubject);

    res
      .status(200)
      .json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Error sending reset password link:', error);
    res.status(500).json({ message: 'Failed to send reset password link.' });
  }
};
