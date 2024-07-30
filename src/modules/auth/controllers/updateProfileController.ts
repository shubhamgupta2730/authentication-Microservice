import { Request, Response } from 'express';
import User from '../../../models/userModel';

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { firstName, lastName, dob, gender, address } = req.body;

  try {
    const userProfile = await User.findOneAndUpdate(
      { _id: userId },
      { firstName, lastName, dob, gender, address },
      { new: true, runValidators: true, upsert: true }
    );

    const user = {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      dob: userProfile.dob,
      gender: userProfile.gender,
      address: userProfile.address,
    };

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
