import User from '../models/User';
import { sendOtpEmail } from '../services/emailService';
import { generateOtp, verifyOtp } from '../utils/otpUtil';
import logger from '../logger';
import { CustomRequest, CustomResponse } from '../rabbitMQ/consumer';

export const sendOtp = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const otp = generateOtp();
    await sendOtpEmail(email, otp);

    user.otp = otp;
    await user.save();

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    const err = error as Error;
    logger.error(`Error sending OTP: ${err.message}`);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOtpForRegistration = async (
  req: CustomRequest,
  res: CustomResponse
) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.otp && verifyOtp(user.otp, otp)) {
      user.isVerified = true;
      user.otp = undefined;
      await user.save();

      res.status(200).json({ message: 'User verified and activated' });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    const err = error as Error;
    logger.error(`Error verifying OTP: ${err.message}`);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};
