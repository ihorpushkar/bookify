import { Request } from 'express';
import { Role } from '@prisma/client';

export {
  AppError,
  NotFoundError,
  UserNotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from '../utils/errors';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: Role;
}

export const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;
