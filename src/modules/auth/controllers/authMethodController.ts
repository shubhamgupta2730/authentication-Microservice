import { Request, Response } from 'express';
import User from '../../../models/userModel';
import Otp from '../../../models/OtpModel';

export const updateAuthenticationMethod = async (
  req: Request,
  res: Response
) => {
  const { id, twoFactorMethod, twoFactorEnabled } = req.body;

  const allowedMethods = ['email', 'phone', 'authenticator'];

  if (!id || !twoFactorMethod || !twoFactorEnabled) {
    return res
      .status(400)
      .json({ message: 'ID and Two-Factor Method are required.' });
  }

  if (!allowedMethods.includes(twoFactorMethod)) {
    return res.status(400).json({
      message: `Invalid Two-Factor Method. Allowed methods are: ${allowedMethods.join(', ')}.`,
    });
  }

  try {
    const otpRecord = await Otp.findById(id);
    if (!otpRecord) {
      return res.status(401).json({
        message: 'user not found',
      });
    }
    const user = await User.findOne(otpRecord.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.twoFactorMethod = twoFactorMethod;
    user.twoFactorEnabled = twoFactorEnabled;
    await user.save();

    if (twoFactorEnabled == 'true') {
      res.status(200).json({
        message: `Authentication method updated successfully to: ${twoFactorMethod}`,
      });
    } else {
      res.status(200).json({
        message: `Authentication Method is Disabled.`,
      });
    }
  } catch (error) {
    console.error('Error updating authentication method:', error);
    res.status(500).json({
      message: `Failed to update authentication method to: ${twoFactorMethod}`,
    });
  }
};
