import { Request, Response } from 'express';
import Auth from '../../../models/AuthModel';
import bcrypt from 'bcrypt';

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Token and new password are required.' });
  }

  try {
    const user = await Auth.findOne({
      resetToken: token.toString(),
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
};
