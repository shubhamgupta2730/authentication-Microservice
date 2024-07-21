import { Request, Response } from 'express';
import User, { IUser } from '../../../models/userModel';
import Auth, { IAuth } from '../../../models/AuthModel';

export const viewProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const userProfile: IUser | null = await User.findOne({ authId: userId });
    if (!userProfile) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const authProfile: IAuth | null = await Auth.findOne({
      _id: userProfile.authId,
    });
    if (!authProfile) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const user = {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: authProfile.email,
      phone: authProfile.phone,
      countrycode: authProfile.countryCode,
      dob: userProfile.dob,
      gender: userProfile.gender,
    };

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Failed to get profile.' });
  }
};
