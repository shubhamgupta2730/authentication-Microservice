import { Schema, model, Document } from 'mongoose';

export interface IAuth extends Document {
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'email' | 'phone' | 'authenticator';
  role: 'user' | 'seller';
}

const AuthSchema: Schema<IAuth> = new Schema(
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
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorMethod: {
      type: String,
      enum: ['email', 'phone', 'authenticator'],
    },
    role: {
      type: String,
      enum: ['user', 'seller'],
      required: true,
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

const Auth = model<IAuth>('Auth', AuthSchema);

export default Auth;
