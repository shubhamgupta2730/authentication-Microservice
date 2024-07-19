import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Auth, { IAuth } from '../../../models/AuthModel';
import User, { IUser } from '../../../models/userModel';
import {
  generateEmailOTP,
  generatePhoneOTP,
} from '../../../services/otpService';

export const signup = async (req: Request, res: Response) => {
  const {
    email,
    password,
    userName,
    countryCode,
    phone,
    gender,
    dob,
    address,
  } = req.body;

  try {
    if (!email || !password || !userName || !phone || !countryCode) {
      return res.status(400).send({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const emailOtp = await generateEmailOTP(email);
    const phoneOtp = await generatePhoneOTP(countryCode, phone);

    const newAuth: IAuth = new Auth({
      email,
      password: hashedPassword,
      phone,
      emailOtp,
      phoneOtp,
      countryCode,
      emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await newAuth.save();

    const newUser: IUser = new User({
      authId: newAuth._id,
      userName,
      gender,
      dob,
      address,
    });
    await newUser.save();

    res.status(201).json({
      userId: newAuth._id,
      message: 'Signup successful. Please verify the Email and Phone Number.',
    });
  } catch (error) {
    console.error('Error in Signup:', error);
    res.status(500).send({ message: 'Failed to Signup.' });
  }
};
