function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not defined`);
  }
  return value;
}

const WEAK_JWT_SECRETS = new Set([
  'change-me-to-a-random-secret-key-min-32-chars',
  'test-jwt-secret-key-minimum-32-characters',
]);

export function validateEnv(): void {
  const jwtSecret = requireEnv('JWT_SECRET');
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  if (WEAK_JWT_SECRETS.has(jwtSecret)) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set to a unique random value in production');
    }
    console.warn('[security] JWT_SECRET uses a default placeholder — change it before deploy');
  }

  requireEnv('DATABASE_URL');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  jwtSecret: () => requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  port: Number(process.env.PORT) || 3000,
  emailFrom: process.env.EMAIL_FROM ?? 'Bookify <noreply@bookify.test>',
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
};
