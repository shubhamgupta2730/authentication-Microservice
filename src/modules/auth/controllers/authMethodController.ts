import { Request, Response } from 'express';
import Auth from '../../../models/AuthModel';

export const updateAuthenticationMethod = async (
  req: Request,
  res: Response
) => {
  const { userId, twoFactorMethod, twoFactorEnabled } = req.body;

  const allowedMethods = ['email', 'phone', 'authenticator'];

  if (!userId || !twoFactorMethod || !twoFactorEnabled) {
    return res
      .status(400)
      .json({ message: 'User ID and Two-Factor Method are required.' });
  }

  if (!allowedMethods.includes(twoFactorMethod)) {
    return res.status(400).json({
      message: `Invalid Two-Factor Method. Allowed methods are: ${allowedMethods.join(', ')}.`,
    });
  }

  try {
    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.twoFactorMethod = twoFactorMethod;
    user.twoFactorEnabled = twoFactorEnabled;
    await user.save();

    res.status(200).json({
      message: `Authentication method updated successfully to: ${twoFactorMethod}`,
    });
  } catch (error) {
    console.error('Error updating authentication method:', error);
    res.status(500).json({
      message: `Failed to update authentication method to: ${twoFactorMethod}`,
    });
  }
};
