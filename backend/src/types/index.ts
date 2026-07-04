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

export type UserRole = Role;

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthUser {
  userId: string;
  role: Role;
}

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: Role;
  user?: AuthUser;
}

export const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;
