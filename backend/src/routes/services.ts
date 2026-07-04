import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createService,
  deleteService,
  listServices,
  updateService,
} from '../controllers/serviceController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/', asyncHandler(listServices));
router.post(
  '/',
  asyncHandler(authenticate),
  asyncHandler(requireRole(Role.PROVIDER)),
  asyncHandler(createService),
);
router.patch(
  '/:id',
  asyncHandler(authenticate),
  asyncHandler(requireRole(Role.PROVIDER)),
  asyncHandler(updateService),
);
router.delete(
  '/:id',
  asyncHandler(authenticate),
  asyncHandler(requireRole(Role.PROVIDER)),
  asyncHandler(deleteService),
);

export default router;
