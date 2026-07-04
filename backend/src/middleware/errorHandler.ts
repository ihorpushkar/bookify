import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

function sendError(res: Response, statusCode: number, error: string): void {
  res.status(statusCode).json({ success: false, error, message: error });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('Database error:', { code: err.code, meta: err.meta });
    sendError(res, 500, env.isProduction ? 'Internal server error' : 'Database operation failed');
    return;
  }

  console.error('Unhandled error:', err);

  const error = env.isProduction ? 'Internal server error' : err.message;

  sendError(res, 500, error);
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
