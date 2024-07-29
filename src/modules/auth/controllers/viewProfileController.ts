import { Request, Response } from 'express';
import User, { IUser } from '../../../models/userModel';

export const viewProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const userProfile: IUser | null = await User.findOne({ _id: userId });
    if (!userProfile) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phone: userProfile.phone,
      countrycode: userProfile.countryCode,
      dob: userProfile.dob,
      gender: userProfile.gender,
      address: userProfile.address,
    };

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Failed to get profile.' });
  }
};
