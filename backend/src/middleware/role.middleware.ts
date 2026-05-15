import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AppError } from '../utils/helpers';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};
