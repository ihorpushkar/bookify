import { Router } from 'express';
import { Role } from '@prisma/client';
import { getProvider, getProviderSlots, updateMyProviderProfile } from '../controllers/providerController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.patch(
  '/me',
  asyncHandler(authenticate),
  asyncHandler(requireRole(Role.PROVIDER)),
  asyncHandler(updateMyProviderProfile),
);
router.get('/:id/slots', asyncHandler(getProviderSlots));
router.get('/:id', asyncHandler(getProvider));

export default router;
