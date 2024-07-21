import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Auth, { IAuth } from '../../../models/AuthModel';
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
    firstName,
    lastName,
    gender,
    dob,
    role,
  } = req.body;

  try {
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !phone ||
      !countryCode ||
      !gender ||
      !dob ||
      !role
    ) {
      return res.status(400).send({ message: 'All fields are required.' });
    }

    const existingUser = await Auth.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: 'Email or phone already in use.' });
    }

    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).send({ message: 'Invalid gender.' });
    }

    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime()) || dobDate >= new Date()) {
      return res.status(400).send({ message: 'Invalid date of birth.' });
    }

    if (!['user', 'seller'].includes(role)) {
      return res.status(400).send({ message: 'Invalid role.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const emailOtp = await generateEmailOTP(email);
    const phoneOtp = await generatePhoneOTP(countryCode, phone);

    const newAuth: IAuth = new Auth({
      email,
      password: hashedPassword,
      phone,
      countryCode,
      role,
    });

    await newAuth.save();

    const newUser: IUser = new User({
      authId: newAuth._id,
      firstName,
      lastName,
      gender,
      dob,
    });
    await newUser.save();

    const newOtp: IOtp = new Otp({
      authId: newAuth._id,
      emailOtp,
      phoneOtp,
      emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });
    await newOtp.save();

    res.status(201).json({
      userId: newAuth._id,
      message:
        'Signup request successful. Please verify the Email and Phone Number.',
    });
  } catch (error) {
    console.error('Error in Signup:', error);
    res.status(500).send({ message: 'Failed to Signup.' });
  }
};
