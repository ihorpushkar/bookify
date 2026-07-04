process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? 'test-jwt-secret-key-minimum-32-characters';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://bookify:bookify@localhost:5432/bookify';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
