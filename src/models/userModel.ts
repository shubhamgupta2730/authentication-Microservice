import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  authId: Schema.Types.ObjectId; 
  userName: string;
  address: string;
  dob: Date | null;
  gender: string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    authId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>('User', UserSchema);

export default User;
