import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/helpers';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(', ');
      return next(new AppError(`Validation Error: ${errors}`, 400));
    }

    req.body = result.data;
    next();
  };
};
