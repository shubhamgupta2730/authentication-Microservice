import twilio from 'twilio';
import logger from '../logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const sendOtpPhone = async (to: string, body: string) => {
  logger.info(`Preparing to send OTP to phone number: ${to}`);
  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(`SMS successfully sent to ${to}`);
  } catch (error) {
    const err = error as Error;
    logger.error(`Error sending SMS to ${to}: ${err.message}`);
  }
};
