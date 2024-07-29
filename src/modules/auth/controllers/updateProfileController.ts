import { Request, Response } from 'express';
import User from '../../../models/userModel';

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { firstName, lastName, dob, gender, address } = req.body;

  // Validate address
  if (!address || typeof address !== 'object') {
    return res.status(400).send({ message: 'Address is required.' });
  }

  const {
    addressLine1,
    addressLine2,
    street,
    city,
    state,
    postalCode,
    country,
  } = address;

  if (
    !addressLine1 ||
    typeof addressLine1 !== 'string' ||
    addressLine1.length < 5 ||
    addressLine1.length > 200
  ) {
    return res.status(400).send({
      message: 'Invalid address line 1. Must be between 5 and 200 characters.',
    });
  }

  if (
    addressLine2 &&
    (typeof addressLine2 !== 'string' || addressLine2.length > 200)
  ) {
    return res.status(400).send({
      message: 'Invalid address line 2. Must be at most 200 characters.',
    });
  }

  if (
    !street ||
    typeof street !== 'string' ||
    street.length < 5 ||
    street.length > 100
  ) {
    return res.status(400).send({
      message: 'Invalid street. Must be between 5 and 100 characters.',
    });
  }

  if (
    !city ||
    typeof city !== 'string' ||
    city.length < 2 ||
    city.length > 50
  ) {
    return res
      .status(400)
      .send({ message: 'Invalid city. Must be between 2 and 50 characters.' });
  }

  if (
    !state ||
    typeof state !== 'string' ||
    state.length < 2 ||
    state.length > 50
  ) {
    return res
      .status(400)
      .send({ message: 'Invalid state. Must be between 2 and 50 characters.' });
  }

  const postalCodeRegex = /^\d{4,8}$/;
  if (
    !postalCode ||
    typeof postalCode !== 'string' ||
    !postalCodeRegex.test(postalCode)
  ) {
    return res.status(400).send({
      message: 'Invalid postal code. Must be between 4 and 8 digits.',
    });
  }

  if (
    !country ||
    typeof country !== 'string' ||
    country.length < 2 ||
    country.length > 50
  ) {
    return res.status(400).send({
      message: 'Invalid country. Must be between 2 and 50 characters.',
    });
  }

  if (!['male', 'female', 'other'].includes(gender)) {
    return res.status(400).send({ message: 'Invalid gender.' });
  }

  const dobDate = new Date(dob);
  if (isNaN(dobDate.getTime()) || dobDate >= new Date()) {
    return res.status(400).send({ message: 'Invalid date of birth.' });
  }

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
