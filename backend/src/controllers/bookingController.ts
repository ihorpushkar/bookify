import { Response } from 'express';
import { BookingStatus } from '@prisma/client';
import prisma from '../config/database';
import {
  notifyClientOfBookingConfirmation,
  notifyProviderOfNewBooking,
} from '../services/bookingEmailService';
import {
  createBooking,
  serializeBooking,
  updateBookingStatus,
} from '../services/bookingService';
import { AuthRequest, ForbiddenError } from '../types';
import { getProviderProfileByUserId } from '../utils/serviceHelpers';
import {
  bookingStatusSchema,
  createBookingSchema,
  CreateBookingInput,
  getParamId,
  paginationSchema,
  validateBody,
  validateQuery,
} from '../utils/validation';

export async function createBookingHandler(req: AuthRequest, res: Response): Promise<void> {
  if (!req.userId) {
    throw new ForbiddenError();
  }

  const { serviceId, startTime } = validateBody<CreateBookingInput>(createBookingSchema, req.body);
  const booking = await createBooking(req.userId, serviceId, new Date(startTime));

  notifyProviderOfNewBooking(booking.id);

  res.status(201).json({
    success: true,
    data: serializeBooking(booking),
  });
}

export async function getMyBookings(req: AuthRequest, res: Response): Promise<void> {
  if (!req.userId) {
    throw new ForbiddenError();
  }

  const { page, limit } = validateQuery(paginationSchema, req.query);
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { clientId: req.userId },
      skip,
      take: limit,
      orderBy: { startTime: 'desc' },
      include: {
        service: { select: { id: true, name: true, durationMin: true, price: true } },
        client: { select: { id: true, name: true, email: true } },
        provider: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.booking.count({ where: { clientId: req.userId } }),
  ]);

  res.json({
    success: true,
    data: bookings.map(serializeBooking),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getIncomingBookings(req: AuthRequest, res: Response): Promise<void> {
  if (!req.userId) {
    throw new ForbiddenError();
  }

  const profile = await getProviderProfileByUserId(req.userId);
  const { page, limit } = validateQuery(paginationSchema, req.query);
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { providerId: profile.id },
      skip,
      take: limit,
      orderBy: { startTime: 'desc' },
      include: {
        service: { select: { id: true, name: true, durationMin: true, price: true } },
        client: { select: { id: true, name: true, email: true } },
        provider: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.booking.count({ where: { providerId: profile.id } }),
  ]);

  res.json({
    success: true,
    data: bookings.map(serializeBooking),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function updateBookingStatusHandler(req: AuthRequest, res: Response): Promise<void> {
  if (!req.userId || !req.userRole) {
    throw new ForbiddenError();
  }

  const bookingId = getParamId(req.params, 'Booking');
  const { status } = validateBody<{ status: BookingStatus }>(bookingStatusSchema, req.body);

  const booking = await updateBookingStatus(bookingId, req.userId, req.userRole, status);

  if (status === BookingStatus.CONFIRMED) {
    notifyClientOfBookingConfirmation(booking.id);
  }

  res.json({
    success: true,
    data: serializeBooking(booking),
  });
}
