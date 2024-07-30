import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { IUser } from '../../../models/userModel';
import Otp, { IOtp } from '../../../models/OtpModel';
import {
  generateEmailOTP,
  generatePhoneOTP,
} from '../../../services/otpService';

export const signup = async (req: Request, res: Response) => {
  const {
    email,
    password,
    countryCode,
    phone,
    role,
    firstName,
    lastName,
    dob,
    gender,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const emailOtp = await generateEmailOTP(email);
    const phoneOtp = await generatePhoneOTP(countryCode, phone);

    const newUser: IUser = new User({
      firstName,
      lastName,
      dob,
      gender,
      countryCode,
      phone,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    const newOtp: IOtp = new Otp({
      userId: newUser._id,
      emailOtp,
      phoneOtp,
      emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });
    await newOtp.save();

    res.status(201).json({
      _id: newOtp._id,
      message:
        'Signup request successful.OTP is sent to your Phone and email address. Please verify the Email and Phone Number.',
    });
  } catch (error) {
    console.error('Error in Signup:', error);
    res.status(500).send({ message: 'Failed to Signup.' });
  }
};
