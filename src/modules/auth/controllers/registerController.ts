import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Auth, { IAuth } from '../../../models/AuthModel';
import {
  generateEmailOTP,
  generatePhoneOTP,
} from '../../../services/otpService';

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, name, countryCode, phone } = req.body;

  try {
    if (!email || !password || !name || !phone || !countryCode) {
      return res.status(400).send({ message: 'All fields are required.' });
    }

    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const emailOtp = await generateEmailOTP(email);
    const phoneOtp = await generatePhoneOTP(countryCode, phone);

    const newUser: IAuth = new Auth({
      email,
      password: hashedPassword,
      name,
      phone,
      emailOtp,
      phoneOtp,
      countryCode,
      emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await newUser.save();

    res.status(201).json({
      userId: newUser._id,
      message:
        'User registered successfully. Please verify the Email and Phone Number.',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send({ message: 'Failed to register user.' });
  }
};
