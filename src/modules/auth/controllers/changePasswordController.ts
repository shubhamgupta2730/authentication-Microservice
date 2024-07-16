import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Auth from '../../../models/AuthModel';

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword, verifyNewPassword } = req.body;
  const userId = (req as any).userId;
  if (!currentPassword || !newPassword || !verifyNewPassword) {
    return res.status(400).json({
      message: ' current password, and new password are required.',
    });
  }

  if (newPassword !== verifyNewPassword) {
    return res.status(400).json({
      message: 'new password and verify new password does not match.',
    });
  }

  try {
    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password.' });
  }
};
