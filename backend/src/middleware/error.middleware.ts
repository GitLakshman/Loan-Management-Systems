import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/helpers';

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err.message || err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    res.status(400).json({
      success: false,
      message: messages.join(', '),
      error: err.message,
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    res.status(409).json({
      success: false,
      message: `An account or record with that ${field} already exists.`,
      error: err.message,
    });
    return;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: `Invalid format for ${err.path}`,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Your token has expired. Please log in again.',
    });
    return;
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again later.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
