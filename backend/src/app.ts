import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

export function buildApp() {
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

  return app;
}
