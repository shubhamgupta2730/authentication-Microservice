import nodemailer from 'nodemailer';
import twilio from 'twilio';
import User from '../models/userModel';
import Otp from '../models/OtpModel';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

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

//! sending  reset password link to mail:

export const sendResetPasswordLinkToMail = async (
  email: string,
  text: string,
  subject: string
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || '',
    to: email,
    subject: subject,
    text: text,
  };

  await transporter.sendMail(mailOptions);
};

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

export const generatePhoneOTP = async (
  countryCode: string,
  to: string
): Promise<string> => {
  const otp = generateOTP(6);

 // const formattedPhone = `${countryCode}${to}`;

  try {
    // await twilioClient.messages.create({
    //   body: `Your OTP for phone verification is ${otp}`,
    //   to: formattedPhone,
    //   from: process.env.TWILIO_PHONE_NUMBER || '',
    // });

    return otp;
  } catch (error) {
    console.error('Error sending OTP via Twilio:', error);
    throw error;
  }
};

//!  Generate base32 encoded secret for authenticator app

// export const generateAuthenticatorSecret = (): string => {
//   const secret = speakeasy.generateSecret({ length: 20 });
//   return secret.base32;
// };

// Generate TOTP secret and otpauth URL
export const generateTotpSecret = (email: string) => {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, 'Authenticator', secret);
  return { secret, otpauth };
};

// Generate QR code for TOTP secret
export const generateTotpQrcode = async (otpauth: string) => {
  try {
    const qrCodeDataUrl = await qrcode.toDataURL(otpauth);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error('Error generating QR code');
  }
};

//*--------------------Verify OTP--------------------------------------//

//! Verify OTP for email verification

export const verifyEmailOTP = async (
  email: string,
  otp: string
): Promise<boolean> => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return false;
    }
    const otpRecord = await Otp.findOne({ userId: user._id });
    if (!otpRecord) {
      return false;
    }

    if (otp !== otpRecord.emailOtp) {
      return false;
    }

    // Update email verification status
    otpRecord.isTempMailVerified = true;
    user.isEmailVerified = true;

    if (otpRecord.tempMail && otpRecord.isTempMailVerified) {
      user.email = otpRecord.tempMail;
      otpRecord.tempMail = undefined;
    }
    otpRecord.emailOtp = undefined;
    await otpRecord.save();
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
    const user = await User.findOne({ phone });
    if (!user) {
      return false;
    }

    const otpRecord = await Otp.findOne({ userId: user._id });
    if (!otpRecord) {
      return false;
    }

    if (otp !== otpRecord.phoneOtp) {
      return false;
    }

    user.isPhoneVerified = true;
    otpRecord.isTempPhoneVerified = true;
    if (
      otpRecord.tempPhone &&
      otpRecord.isTempPhoneVerified &&
      otpRecord.tempCountryCode
    ) {
      user.phone = otpRecord.tempPhone;
      user.countryCode = otpRecord.tempCountryCode;
      otpRecord.tempPhone = undefined;
      otpRecord.tempCountryCode = undefined;
    }
    otpRecord.phoneOtp = undefined;
    await otpRecord.save();
    await user.save();

    return true;
  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    return false;
  }
};

//! Verify OTP for authenticator app

// Verify TOTP token
export const verifyTotpToken = (token: string, secret: string): boolean => {
  return authenticator.check(token, secret);
};
