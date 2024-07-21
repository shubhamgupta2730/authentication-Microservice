import { Schema, model, Document } from 'mongoose';

export interface IOtp extends Document {
  authId: Schema.Types.ObjectId;
  emailOtp?: string;
  emailOtpExpires?: Date;
  phoneOtp?: string;
  phoneOtpExpires?: Date;
  twoFactorSecret?: string;
  authenticatorSecret?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  tempMail?: string;
  tempPhone?: string;
  isTempMailVerified: boolean;
  isTempPhoneVerified: boolean;
}

const OtpSchema: Schema<IOtp> = new Schema(
  {
    authId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
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

    authenticatorSecret: {
      type: String,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpires: {
      type: Date,
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

const Otp = model<IOtp>('Otp', OtpSchema);

export default Otp;
