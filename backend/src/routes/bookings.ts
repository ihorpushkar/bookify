import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createBookingHandler,
  getIncomingBookings,
  getMyBookings,
  updateBookingStatusHandler,
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.post(
  '/',
  asyncHandler(authenticate),
  asyncHandler(requireRole(Role.CLIENT, Role.ADMIN)),
  asyncHandler(createBookingHandler),
);
router.get(
  '/me',
  asyncHandler(authenticate),
  asyncHandler(requireRole(Role.CLIENT, Role.ADMIN)),
  asyncHandler(getMyBookings),
);
router.get(
  '/incoming',
  asyncHandler(authenticate),
  asyncHandler(requireRole(Role.PROVIDER, Role.ADMIN)),
  asyncHandler(getIncomingBookings),
);
router.patch(
  '/:id/status',
  asyncHandler(authenticate),
  asyncHandler(updateBookingStatusHandler),
);

export default router;
