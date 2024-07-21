import { Request, Response } from 'express';
import User from '../../../models/userModel';

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { firstName, lastName, dob, gender } = req.body;

  try {
    const userProfile = await User.findOneAndUpdate(
      { authId: userId },
      { firstName, lastName, dob, gender },
      { new: true, runValidators: true, upsert: true }
    );

    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).send({ message: 'Invalid gender.' });
    }

    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime()) || dobDate >= new Date()) {
      return res.status(400).send({ message: 'Invalid date of birth.' });
    }

    const user = {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      dob: userProfile.dob,
      gender: userProfile.gender,
    };

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
