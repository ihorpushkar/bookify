import {
  addMinutes,
  endOfDay,
  format,
  isBefore,
  parse,
  startOfDay,
} from 'date-fns';
import { BookingStatus, Prisma, Role } from '@prisma/client';
import prisma from '../config/database';
import { WorkingHours } from '../constants/workingHours';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../types';

const ACTIVE_STATUSES: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

const DAY_KEYS: (keyof WorkingHours)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    service: { select: { id: true; name: true; durationMin: true; price: true } };
    client: { select: { id: true; name: true; email: true } };
    provider: { select: { id: true; userId: true; user: { select: { id: true; name: true } } } };
  };
}>;

export type Slot = {
  startTime: string;
  endTime: string;
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getDayKey(date: Date): keyof WorkingHours {
  return DAY_KEYS[date.getDay()];
}

function parseTimeOnDate(dateStr: string, time: string): Date {
  return parse(`${dateStr} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
}

function isSameDay(a: Date, b: Date): boolean {
  return format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd');
}

export function assertWithinWorkingHours(
  workingHours: WorkingHours,
  startTime: Date,
  endTime: Date,
): void {
  if (!isSameDay(startTime, endTime)) {
    throw new ValidationError('Booking must fit within a single day');
  }

  const dayKey = getDayKey(startTime);
  const ranges = workingHours[dayKey];

  if (!ranges.length) {
    throw new ValidationError('Provider is not available on this day');
  }

  const startMin = startTime.getHours() * 60 + startTime.getMinutes();
  const endMin = endTime.getHours() * 60 + endTime.getMinutes();

  const fits = ranges.some((range) => {
    const rangeStart = timeToMinutes(range.start);
    const rangeEnd = timeToMinutes(range.end);
    return startMin >= rangeStart && endMin <= rangeEnd;
  });

  if (!fits) {
    throw new ValidationError('Booking is outside provider working hours');
  }
}

function slotsOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB;
}

export async function assertNoConflict(
  providerId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string,
  tx: Prisma.TransactionClient = prisma,
): Promise<void> {
  const conflict = await tx.booking.findFirst({
    where: {
      providerId,
      status: { in: ACTIVE_STATUSES },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
  });

  if (conflict) {
    throw new ConflictError('Time slot is not available');
  }
}

async function getServiceWithProvider(serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      provider: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!service) {
    throw new NotFoundError('Service not found');
  }

  return service;
}

export async function generateAvailableSlots(
  providerId: string,
  serviceId: string,
  dateStr: string,
): Promise<Slot[]> {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, providerId },
    include: { provider: true },
  });

  if (!service) {
    throw new NotFoundError('Service not found for this provider');
  }

  const workingHours = service.provider.workingHours as WorkingHours;
  const dayKey = getDayKey(parse(`${dateStr}T12:00:00`, "yyyy-MM-dd'T'HH:mm:ss", new Date()));
  const ranges = workingHours[dayKey];

  if (!ranges.length) {
    return [];
  }

  const dayStart = startOfDay(parse(`${dateStr}T00:00:00`, "yyyy-MM-dd'T'HH:mm:ss", new Date()));
  const dayEnd = endOfDay(dayStart);

  const existingBookings = await prisma.booking.findMany({
    where: {
      providerId,
      status: { in: ACTIVE_STATUSES },
      startTime: { lte: dayEnd },
      endTime: { gte: dayStart },
    },
    select: { startTime: true, endTime: true },
  });

  const slots: Slot[] = [];
  const now = new Date();

  for (const range of ranges) {
    let slotStart = parseTimeOnDate(dateStr, range.start);
    const rangeEnd = parseTimeOnDate(dateStr, range.end);

    while (addMinutes(slotStart, service.durationMin) <= rangeEnd) {
      const slotEnd = addMinutes(slotStart, service.durationMin);

      if (!isBefore(slotStart, now)) {
        const hasConflict = existingBookings.some((booking) =>
          slotsOverlap(slotStart, slotEnd, booking.startTime, booking.endTime),
        );

        if (!hasConflict) {
          slots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
          });
        }
      }

      slotStart = addMinutes(slotStart, service.durationMin);
    }
  }

  return slots;
}

export async function createBooking(clientId: string, serviceId: string, startTime: Date) {
  const service = await getServiceWithProvider(serviceId);
  const endTime = addMinutes(startTime, service.durationMin);
  const workingHours = service.provider.workingHours as WorkingHours;

  assertWithinWorkingHours(workingHours, startTime, endTime);

  if (isBefore(startTime, new Date())) {
    throw new ValidationError('Cannot book a slot in the past');
  }

  return prisma.$transaction(async (tx) => {
    await assertNoConflict(service.providerId, startTime, endTime, undefined, tx);

    return tx.booking.create({
      data: {
        clientId,
        serviceId: service.id,
        providerId: service.providerId,
        startTime,
        endTime,
      },
      include: bookingInclude,
    });
  });
}

export async function updateBookingStatus(
  bookingId: string,
  actorUserId: string,
  actorRole: Role,
  newStatus: BookingStatus,
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      provider: { select: { userId: true } },
    },
  });

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  assertCanUpdateStatus(actorUserId, actorRole, booking, newStatus);

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus },
    include: bookingInclude,
  });
}

function assertCanUpdateStatus(
  userId: string,
  userRole: Role,
  booking: { status: BookingStatus; clientId: string; provider: { userId: string } },
  newStatus: BookingStatus,
): void {
  const isClient = booking.clientId === userId;
  const isProvider = booking.provider.userId === userId;
  const isAdmin = userRole === Role.ADMIN;

  if (newStatus === BookingStatus.CANCELLED) {
    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new ValidationError('Cannot cancel this booking');
    }

    if (!isClient && !isProvider && !isAdmin) {
      throw new ForbiddenError('You cannot cancel this booking');
    }

    return;
  }

  if (newStatus === BookingStatus.CONFIRMED) {
    if (booking.status !== BookingStatus.PENDING) {
      throw new ValidationError('Only pending bookings can be confirmed');
    }

    if (!isProvider && !isAdmin) {
      throw new ForbiddenError('Only the provider can confirm bookings');
    }

    return;
  }

  if (newStatus === BookingStatus.COMPLETED) {
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new ValidationError('Only confirmed bookings can be completed');
    }

    if (!isProvider && !isAdmin) {
      throw new ForbiddenError('Only the provider can complete bookings');
    }

    return;
  }

  throw new ValidationError('Invalid status transition');
}

export const bookingInclude = {
  service: {
    select: { id: true, name: true, durationMin: true, price: true },
  },
  client: {
    select: { id: true, name: true, email: true },
  },
  provider: {
    select: {
      id: true,
      userId: true,
      user: { select: { id: true, name: true } },
    },
  },
} as const;

export function serializeBooking(booking: BookingWithRelations) {
  return {
    ...booking,
    service: {
      ...booking.service,
      price:
        typeof booking.service.price === 'object' && 'toNumber' in booking.service.price
          ? booking.service.price.toNumber()
          : Number(booking.service.price),
    },
  };
}
