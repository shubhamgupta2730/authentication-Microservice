import { Request, Response } from 'express';
import UserProfile from '../../../models/userModel';

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { username, address, dob, gender } = req.body;

  try {
    const userProfile = await UserProfile.findOneAndUpdate(
      { authId: userId },
      { username, address, dob, gender },
      { new: true, runValidators: true, upsert: true }
    );

    const user = {
      userName: userProfile.userName,
      address: userProfile.address,
      dob: userProfile.dob,
      gender: userProfile.gender,
    };

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
