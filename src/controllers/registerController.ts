import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Auth, { IAuth } from '../models/AuthModel';
import { generateEmailOTP, generatePhoneOTP } from '../services/otpService';

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, name, phone } = req.body;

  try {
    if (!email || !password || !name || !phone) {
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
    const phoneOtp = await generatePhoneOTP(phone);

    const newUser: IAuth = new Auth({
      email,
      password: hashedPassword,
      name,
      phone,
      emailOtp,
      phoneOtp,
      emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || '',
      {
        expiresIn: '1h',
      }
    );

    res.status(201).json({
      userId: newUser._id,
      token,
      message:
        'User registered successfully. Please verify the Email and Phone Number.',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send({ message: 'Failed to register user.' });
  }
};
