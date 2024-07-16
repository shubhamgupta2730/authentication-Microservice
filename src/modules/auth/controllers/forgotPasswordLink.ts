import { Request, Response } from 'express';
import Auth from '../../../models/AuthModel';
import { sendResetPasswordLinkToMail } from '../../../services/otpService';

const generateResetToken = (): string => {
  return Math.random().toString(36).slice(2);
};

export const forgotPasswordLink = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const resetToken = generateResetToken();
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetLink = `http://localhost:3000/api/v1/auth/reset-password?token=${resetToken}`;
    const mailSubject = 'Password Reset Link';
    const mailText = `Click the following link to reset your password: ${resetLink}`;

    await sendResetPasswordLinkToMail(email, mailText, mailSubject);

    res
      .status(200)
      .json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Error sending reset password link:', error);
    res.status(500).json({ message: 'Failed to send reset password link.' });
  }
};
