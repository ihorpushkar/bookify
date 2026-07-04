import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase, disconnectDatabase } from './config/database';
import { validateEnv, env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

validateEnv();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: env.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.get('/', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', routes);
app.use(errorHandler);

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
