import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * Global Error Handler Middleware (Chain of Responsibility Pattern)
 *
 * Catches all errors thrown in the request pipeline and sends
 * a standardized JSON error response.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  if (err instanceof AppError && err.isOperational) {
    logger.warn(`Operational error: ${err.message}`);
  } else {
    logger.error('Unexpected error:', err);
  }

  // Handle known operational errors
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    switch (prismaError.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          message: `Duplicate value for: ${prismaError.meta?.target?.join(', ')}`,
        });
        return;
      case 'P2025':
        res.status(404).json({
          success: false,
          message: 'Record not found',
        });
        return;
      default:
        res.status(400).json({
          success: false,
          message: 'Database error',
        });
        return;
    }
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error',
  });
};
