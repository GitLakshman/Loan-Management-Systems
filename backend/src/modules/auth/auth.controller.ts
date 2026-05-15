import { Response } from 'express';
import { AuthRequest } from '../../types';
import { User } from '../users/user.model';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/jwt';
import { asyncHandler, AppError, sendResponse } from '../../utils/helpers';

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fullName, email, password, phoneNumber } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    phoneNumber,
    role: 'BORROWER',
  });

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
  });

  sendResponse(res, 201, true, 'Registration successful', {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    },
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated. Contact admin.', 403);
  }

  // Compare password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
  });

  sendResponse(res, 200, true, 'Login successful', {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    },
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.userId).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  sendResponse(res, 200, true, 'User profile fetched', {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber,
    isActive: user.isActive,
  });
});

export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  // For JWT, logout is handled client-side by removing the token
  sendResponse(res, 200, true, 'Logged out successfully');
});
