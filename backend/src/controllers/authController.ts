import { Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../config/database';
import { DEFAULT_WORKING_HOURS } from '../constants/workingHours';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/password';
import {
  AuthRequest,
  ConflictError,
  UnauthorizedError,
  UserNotFoundError,
  userSelect,
} from '../types';
import { loginSchema, refreshSchema, registerSchema, validateBody } from '../utils/validation';

function issueTokens(userId: string) {
  return {
    token: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  const { email, password, name, role } = validateBody(registerSchema, req.body);

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role as Role,
      ...(role === 'PROVIDER'
        ? {
            providerProfile: {
              create: {
                workingHours: DEFAULT_WORKING_HOURS,
                bio: '',
              },
            },
          }
        : {}),
    },
    select: userSelect,
  });

  const tokens = issueTokens(user.id);

  res.status(201).json({
    success: true,
    data: { user, ...tokens },
  });
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { email, password } = validateBody(loginSchema, req.body);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const tokens = issueTokens(user.id);

  const safeUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: userSelect,
  });

  res.json({
    success: true,
    data: { user: safeUser, ...tokens },
  });
}

export async function refreshToken(req: AuthRequest, res: Response): Promise<void> {
  const { refreshToken: token } = validateBody(refreshSchema, req.body);

  try {
    const { userId } = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    res.json({
      success: true,
      data: issueTokens(userId),
    });
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.userId) {
    throw new UnauthorizedError();
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      ...userSelect,
      providerProfile: {
        select: {
          id: true,
          bio: true,
          workingHours: true,
        },
      },
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  res.json({ success: true, data: { user } });
}
