import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/AppError';

/**
 * Validation Middleware (Chain of Responsibility Pattern)
 *
 * Validates request body/query/params against a Zod schema.
 * If validation fails, throws a ValidationError with field-level errors.
 */

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const fieldErrors: Record<string, string[]> = {};

        result.error.issues.forEach((issue) => {
          const field = issue.path.join('.');
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field].push(issue.message);
        });

        throw new ValidationError('Validation failed', fieldErrors);
      }

      // Replace the target with validated (and possibly transformed) data
      req[target] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
