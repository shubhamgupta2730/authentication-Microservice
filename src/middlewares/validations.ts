// validators.js

import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';

// Middleware to check for existing user by email
export const checkExistingUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: 'User with the provided email already exists.' });
    }
    next();
  } catch (error) {
    console.error('Error checking existing user by email:', error);
    return res.status(500).send({ message: 'Internal server error.' });
  }
};

// Middleware to check for existing user by phone
export const checkExistingUserByPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone } = req.body;
  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: 'User with the provided phone already exists.' });
    }
    next();
  } catch (error) {
    console.error('Error checking existing user by phone:', error);
    return res.status(500).send({ message: 'Internal server error.' });
  }
};

// Validation function for user ID
export const validateUserId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }
  next();
};

// Validation function for email
export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }
  next();
};

// Validation function for address
export const validateAddress = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { address } = req.body;
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

  next();
};

// Validation function for gender
export const validateGender = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { gender } = req.body;
  if (!['male', 'female', 'other'].includes(gender)) {
    return res.status(400).send({ message: 'Invalid gender.' });
  }
  next();
};

// Validation function for date of birth
export const validateDob = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { dob } = req.body;
  const dobDate = new Date(dob);
  if (isNaN(dobDate.getTime()) || dobDate >= new Date()) {
    return res.status(400).send({ message: 'Invalid date of birth.' });
  }
  next();
};

// Validation function for phone number
export const validatePhone = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone } = req.body;
  const phoneRegex = /^[0-9]{7,15}$/;
  if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone)) {
    return res.status(400).send({
      message: 'Invalid phone number. Must be between 7 and 15 digits.',
    });
  }
  next();
};

// Validation function for country code
export const validateCountryCode = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { countryCode } = req.body;
  const countryCodeRegex = /^\+[1-9]{1}[0-9]{1,3}$/;
  if (
    !countryCode ||
    typeof countryCode !== 'string' ||
    !countryCodeRegex.test(countryCode)
  ) {
    return res.status(400).send({
      message:
        'Invalid country code. Must start with a "+" followed by 1-4 digits.',
    });
  }
  next();
};

// Validation function for role
export const validateRole = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body;
  if (!['user', 'seller'].includes(role)) {
    return res.status(400).send({ message: 'Invalid role.' });
  }
  next();
};

// Validation function for first name
export const validateFirstName = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { firstName } = req.body;
  const alphaRegex = /^[A-Za-z]+$/;

  if (
    !firstName ||
    typeof firstName !== 'string' ||
    firstName.length < 1 ||
    firstName.length > 50 ||
    !alphaRegex.test(firstName)
  ) {
    return res.status(400).json({
      message:
        'First name is required, must be between 1 and 50 characters, and contain only alphabetic characters.',
    });
  }
  next();
};
