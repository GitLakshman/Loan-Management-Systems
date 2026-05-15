import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '../../types';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  phoneNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.BORROWER,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
