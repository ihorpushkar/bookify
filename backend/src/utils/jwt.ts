import jwt from 'jsonwebtoken';
import { env } from '../config/env';

type TokenPayload = {
  userId: string;
  type: 'access' | 'refresh';
};

function getSecret(): string {
  return env.jwtSecret();
}

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId, type: 'access' }, getSecret(), {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, getSecret(), {
    expiresIn: env.jwtRefreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, getSecret()) as TokenPayload;

  if (decoded.type && decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }

  return { userId: decoded.userId };
}

export function verifyRefreshToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, getSecret()) as TokenPayload;

  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  return { userId: decoded.userId };
}

export function verifyToken(token: string): { userId: string } {
  return verifyAccessToken(token);
}
