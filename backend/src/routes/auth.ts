import { Router } from 'express';
import { register, login, refreshToken, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refreshToken));
router.get('/me', asyncHandler(authenticate), asyncHandler(getProfile));

export default router;
