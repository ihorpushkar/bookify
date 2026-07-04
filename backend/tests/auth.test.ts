import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/app';
import { hashPassword, comparePassword } from '../src/utils/password';
import { generateAccessToken, verifyAccessToken } from '../src/utils/jwt';

const app = buildApp();

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('bookify-api');
  });
});

describe('POST /api/auth/register', () => {
  it('returns 400 for invalid email', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'test123',
      name: 'Test User',
      role: 'CLIENT',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns 400 for short password', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: '123',
      name: 'Test User',
      role: 'CLIENT',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 when password is missing', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

describe('auth utilities', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('secret123');
    expect(await comparePassword('secret123', hash)).toBe(true);
    expect(await comparePassword('wrong', hash)).toBe(false);
  });

  it('generates and verifies access tokens', () => {
    const token = generateAccessToken('user-123');
    const payload = verifyAccessToken(token);
    expect(payload.userId).toBe('user-123');
  });
});
