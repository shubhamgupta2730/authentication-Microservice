import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { IUser } from '../../../models/userModel';
import Otp, { IOtp } from '../../../models/OtpModel';
import moment from 'moment';
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
    const requiredFields = [
      { field: 'email', message: 'Email is required.' },
      { field: 'password', message: 'Password is required.' },
      { field: 'phone', message: 'Phone number is required.' },
      { field: 'countryCode', message: 'Country code is required.' },
      { field: 'role', message: 'Role is required.' },
      { field: 'firstName', message: 'First name is required.' },
      { field: 'dob', message: 'Date of birth is required.' },
      { field: 'gender', message: 'Gender is required.' },
    ];

    // Check required fields
    for (const { field, message } of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).send({ message });
      }
    }

    const userWithEmail = await User.findOne({ email });
    if (userWithEmail) {
      return res.status(400).send({ message: 'Email already in use.' });
    }

    // Check if phone already exists
    const userWithPhone = await User.findOne({ phone });
    if (userWithPhone) {
      return res.status(400).send({ message: 'Phone already in use.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({ message: 'Invalid email format.' });
    }

    // Validate phone format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).send({
        message:
          'Invalid phone number. It should contain only digits and be 10 characters long.',
      });
    }

    // Validate country code format
    const countryCodeRegex = /^\+\d+$/;
    if (!countryCodeRegex.test(countryCode)) {
      return res.status(400).send({
        message:
          'Invalid country code. It should start with a "+" and contain only digits.',
      });
    }

    const allowedGenders = ['male', 'female', 'other'];
    if (!allowedGenders.includes(gender)) {
      return res.status(400).send({
        message: 'Invalid gender. Allowed values are male, female, or other.',
      });
    }

    // Check if dob is a valid date
    if (!moment(dob, 'YYYY-MM-DD', true).isValid()) {
      return res
        .status(400)
        .send({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Check if dob is not a future date
    if (moment(dob).isAfter(moment())) {
      return res
        .status(400)
        .send({ message: 'Date of birth cannot be a future date.' });
    }

    if (!['user', 'seller'].includes(role)) {
      return res.status(400).send({ message: 'Invalid role.' });
    }

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
