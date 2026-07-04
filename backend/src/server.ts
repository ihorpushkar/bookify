import 'dotenv/config';
import { buildApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { validateEnv, env } from './config/env';

validateEnv();

const app = buildApp();

async function startServer(): Promise<void> {
  await connectDatabase();

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Bookify API listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default app;
