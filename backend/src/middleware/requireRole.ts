import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import prisma from '../config/database';
import { AuthRequest, ForbiddenError, UnauthorizedError } from '../types';

export function requireRole(...roles: Role[]) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        throw new UnauthorizedError();
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true },
      });

      if (!user) {
        throw new UnauthorizedError();
      }

      req.userRole = user.role;

      if (!roles.includes(user.role)) {
        throw new ForbiddenError();
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
