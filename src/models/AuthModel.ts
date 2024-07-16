import { Schema, model, Document } from 'mongoose';

export interface IAuth extends Document {
  email: string;
  password: string;
  name: string;
  phone: string;
  countryCode: string;
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
}

const AuthSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
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
    twoFactorMethod: {
      type: String,
      enum: ['email', 'phone', 'authenticator'],
    },
    resetToken: {
      type: String,
    },
    resetTokenExpires: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Auth = model<IAuth>('Auth', AuthSchema);

export default Auth;
