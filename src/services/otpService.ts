import nodemailer from 'nodemailer';
import twilio from 'twilio';
import speakeasy from 'speakeasy';
import { totp } from 'speakeasy';
import Auth from '../models/AuthModel';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

//! generate otp function:

export const generateOTP = (length: number): string => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

//*--------------------Generate OTP-------------------------//

//! Generate and send OTP via email:

export const generateEmailOTP = async (email: string): Promise<string> => {
  const otp = generateOTP(6);
  const mailOptions = {
    from: process.env.EMAIL_USER || '',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP for email verification is ${otp}`,
  };

  await transporter.sendMail(mailOptions);

  return otp;
};

//! Generate and send OTP via phone:

export const generatePhoneOTP = async (to: string): Promise<string> => {
  const otp = generateOTP(6);

  const formattedPhone = `+91${to}`;

  try {
    await twilioClient.messages.create({
      body: `Your OTP for phone verification is ${otp}`,
      to: formattedPhone,
      from: process.env.TWILIO_PHONE_NUMBER || '',
    });

    return otp;
  } catch (error) {
    console.error('Error sending OTP via Twilio:', error);
    throw error;
  }
};

//!  Generate base32 encoded secret for authenticator app

export const generateAuthenticatorSecret = (): string => {
  const secret = speakeasy.generateSecret({ length: 20 });
  return secret.base32;
};

//*--------------------Verify OTP--------------------------------------//

//! Verify OTP for email verification

export const verifyEmailOTP = async (
  email: string,
  otp: string
): Promise<boolean> => {
  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return false;
    }

    if (otp !== user.emailOtp) {
      return false;
    }

    // Update email verification status
    user.isEmailVerified = true;
    await user.save();

    return true;
  } catch (error) {
    console.error('Error verifying email OTP:', error);
    return false;
  }
};

//! Verify OTP for phone verification

export const verifyPhoneOTP = async (
  phone: string,
  otp: string
): Promise<boolean> => {
  try {
    const user = await Auth.findOne({ phone });
    if (!user) {
      return false;
    }

    if (otp !== user.phoneOtp) {
      return false;
    }

    user.isPhoneVerified = true;
    await user.save();

    return true;
  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    return false;
  }
};

//! Verify OTP for authenticator app

export const verifyAuthenticatorOTP = (
  otp: string,
  secret: string
): boolean => {
  return totp.verify({ secret, encoding: 'base32', token: otp });
};
