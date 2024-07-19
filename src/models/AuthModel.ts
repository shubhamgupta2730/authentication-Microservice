import { Schema, model, Document } from 'mongoose';

export interface IAuth extends Document {
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailOtp?: string;
  emailOtpExpires?: Date;
  phoneOtp?: string;
  phoneOtpExpires?: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  isAuthenticatorVerified?: boolean;
  authenticatorSecret?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  twoFactorMethod?: 'email' | 'phone' | 'authenticator';
  tempMail?: string;
  tempPhone?: string;
  isTempMailVerified: boolean;
  isTempPhoneVerified: boolean;
}

const AuthSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: {
      type: String,
    },
    emailOtpExpires: {
      type: Date,
    },
    phoneOtp: {
      type: String,
    },
    phoneOtpExpires: {
      type: Date,
    },
    twoFactorSecret: {
      type: String,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    isAuthenticatorVerified: {
      type: Boolean,
      default: false,
    },
    authenticatorSecret: {
      type: String,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpires: {
      type: Date,
    },
    twoFactorMethod: {
      type: String,
      enum: ['email', 'phone', 'authenticator'],
    },
    tempMail: {
      type: String,
    },
    tempPhone: {
      type: String,
    },
    isTempMailVerified: {
      type: Boolean,
      default: false,
    },
    isTempPhoneVerified: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

const Auth = model<IAuth>('Auth', AuthSchema);

export default Auth;
