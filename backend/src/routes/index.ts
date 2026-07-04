import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'bookify-api',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);

router.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', message: 'Route not found' });
});

export default router;
