import { Request, Response } from 'express';
import User from '../../../models/userModel';
import Otp from '../../../models/OtpModel';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Token and new password are required.' });
  }

  try {
    const resetToken = token.toString();
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const otpRecord = await Otp.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findOne({ _id: otpRecord.userId });
    if (!user) {
      return res.status(400).json({ message: 'user record not found' });
    }

    user.password = hashedPassword;
    otpRecord.resetToken = undefined;
    otpRecord.resetTokenExpires = undefined;

    await otpRecord.save();
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
};
