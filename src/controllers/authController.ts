import User from '../models/User';
import { sendOtpEmail } from '../services/emailService';
import jwt from 'jsonwebtoken'
import {
  generateOtp,
  verifyOtp,
  generateTotpSecret,
  generateTotpQrcode,
  verifyTotpToken,
} from '../utils/otpUtil';
import logger from '../logger';
import { CustomRequest, CustomResponse } from '../rabbitMQ/consumer';
import { sendOtpPhone } from '../utils/otpToPhoneUtil';

//! controller for sending otp to email:

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

//! controller for sending otp to phone:
export const sendOtpToPhone = async (
  req: CustomRequest,
  res: CustomResponse
) => {
  try {
    const { phone } = req.body;

    logger.info(`Received request to send OTP to phone for phone number: ${phone}`);

    const user = await User.findOne({ phone });
    if (!user) {
      logger.warn(`User not found for phone number: ${phone}`);
      return res.status(400).json({ error: 'User not found' });
    }
    if (!user.phone) {
      logger.warn(`Phone number not found for user with phone number: ${phone}`);
      return res.status(400).json({ error: 'Phone number not found for user' });
    }

    logger.info(`User found for phone number: ${phone}. Generating OTP...`);

    const otp = generateOtp();
    user.otp = otp;
    await user.save();

    logger.info(`OTP generated and saved for user with phone number: ${phone}. Sending SMS...`);

    await sendOtpPhone(user.phone, `Your OTP is ${otp}`);

    logger.info(`OTP sent to phone number: ${user.phone}`);

    res.status(200).json({ message: 'OTP sent to mobile' });
  } catch (error) {
    const err = error as Error;
    logger.error(`Error sending OTP SMS: ${err.message}`);
    res.status(500).json({ error: 'Failed to send OTP SMS' });
  }
};
//! controller for sending verify otp for registration:

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

//! controller for verify otp for login:
export const verifyOtpForLogin = async (req: CustomRequest, res: CustomResponse, data: { email: string; otp: string }) => {
  try {
    const { email, otp } = data;
    const JWT_SECRET = process.env.JWT_SECRET;

    logger.info(`Received request to verify OTP for login. Email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`User not found for email: ${email}`);
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`User found for email: ${email}. AuthMethod: ${user.authMethod}`);

    if (user.authMethod === 'email' || user.authMethod === 'phone') {
      if (user.otp && verifyOtp(user.otp, otp)) {
        logger.info('OTP verification successful. Logging in...');
        user.otp = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET!, {
          expiresIn: '1h',
        });

        logger.info(`Login successful. Token generated for user: ${email}`);
        return res.status(200).json({ token });
      } else {
        logger.warn('Invalid OTP provided');
        return res.status(400).json({ error: 'Invalid OTP' });
      }
    } else if (user.authMethod === 'authenticator') {
      if (!user.totpSecret) {
        logger.info('User has not set up TOTP yet. Generating TOTP secret...');
        
        const { secret, otpauth } = generateTotpSecret(email);
        user.totpSecret = secret;
        await user.save();

        logger.info('TOTP secret generated and saved. Sending QR code for setup.');
        
        const qrCode = await generateTotpQrcode(otpauth);
        return res.status(200).json({
          message: 'Authenticator setup required',
          qrCode,
        });
      } else {
        logger.info('User has already set up TOTP. Verifying TOTP...');
        
        const validTotp = verifyTotpToken(otp, user.totpSecret);
        if (!validTotp) {
          logger.warn('Invalid TOTP provided');
          return res.status(400).json({ error: 'Invalid TOTP' });
        } else {
          logger.info('TOTP verification successful. Logging in...');
          const token = jwt.sign({ id: user._id }, JWT_SECRET!, {
            expiresIn: '1h',
          });

          logger.info(`Login successful. Token generated for user: ${email}`);
          return res.status(200).json({ token });
        }
      }
    } else {
      logger.warn(`Invalid authentication method: ${user.authMethod}`);
      return res.status(400).json({ error: 'Invalid authentication method' });
    }
  } catch (error) {
    const err = error as Error;
    logger.error(`Error verifying OTP for login: ${err.message}`);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
};