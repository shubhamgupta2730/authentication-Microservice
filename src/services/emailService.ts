import nodemailer from 'nodemailer';
import logger from '../logger';

export const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`OTP sent to email: ${email}`);
  } catch (error) {
    const err = error as Error;
    logger.error(`Error sending OTP email: ${err.message}`);
  }
};
