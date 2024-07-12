import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  phone: string;
  isActive?: boolean; //for blocking and unblocking purpose.
  isVerified?: boolean; //for verificaton
  otp?: string;
  authMethod?: 'email' | 'phone' | 'authenticator';
  totpSecret?: string;
  _id: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  otp: {
    type: String,
  },
  authMethod: {
    type: String,
    enum: ['email', 'phone', 'authenticator'],
    default: ' email ',
  },
  totpSecret: { type: String },
});

export default model<IUser>('User', userSchema);
