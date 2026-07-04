import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BookingStatus } from '@prisma/client';
import { DEFAULT_WORKING_HOURS } from '../src/constants/workingHours';
import { ConflictError, ValidationError } from '../src/types';
import {
  assertNoConflict,
  assertWithinWorkingHours,
  generateAvailableSlots,
} from '../src/services/bookingService';

vi.mock('../src/config/database', () => ({
  default: {
    booking: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    service: {
      findFirst: vi.fn(),
    },
  },
}));

import prisma from '../src/config/database';

const mockPrisma = prisma as {
  booking: {
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  service: {
    findFirst: ReturnType<typeof vi.fn>;
  };
};

function mondayAt(hours: number, minutes = 0): Date {
  // 2026-07-06 is a Monday
  const date = new Date(2026, 6, 6, hours, minutes, 0, 0);
  return date;
}

describe('assertWithinWorkingHours', () => {
  it('allows booking inside working hours', () => {
    const start = mondayAt(10);
    const end = mondayAt(10, 30);

    expect(() => assertWithinWorkingHours(DEFAULT_WORKING_HOURS, start, end)).not.toThrow();
  });

  it('rejects booking outside working hours', () => {
    const start = mondayAt(8);
    const end = mondayAt(8, 30);

    expect(() => assertWithinWorkingHours(DEFAULT_WORKING_HOURS, start, end)).toThrow(
      ValidationError,
    );
  });

  it('rejects booking on a day with no hours', () => {
    const start = new Date(2026, 6, 5, 10, 0, 0, 0); // Sunday
    const end = new Date(2026, 6, 5, 10, 30, 0, 0);

    expect(() => assertWithinWorkingHours(DEFAULT_WORKING_HOURS, start, end)).toThrow(
      ValidationError,
    );
  });

  it('rejects booking spanning two days', () => {
    const start = mondayAt(23, 30);
    const end = new Date(2026, 6, 7, 0, 30, 0, 0);

    expect(() => assertWithinWorkingHours(DEFAULT_WORKING_HOURS, start, end)).toThrow(
      ValidationError,
    );
  });
});

describe('assertNoConflict', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes when no overlapping booking exists', async () => {
    mockPrisma.booking.findFirst.mockResolvedValue(null);

    await expect(
      assertNoConflict('provider-1', mondayAt(10), mondayAt(10, 30)),
    ).resolves.toBeUndefined();
  });

  it('throws ConflictError when slot overlaps', async () => {
    mockPrisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      status: BookingStatus.CONFIRMED,
    });

    await expect(
      assertNoConflict('provider-1', mondayAt(10), mondayAt(10, 30)),
    ).rejects.toThrow(ConflictError);
  });
});

describe('generateAvailableSlots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when provider has no hours on that day', async () => {
    mockPrisma.service.findFirst.mockResolvedValue({
      id: 'service-1',
      durationMin: 30,
      provider: {
        id: 'provider-1',
        workingHours: DEFAULT_WORKING_HOURS,
      },
    });

    const slots = await generateAvailableSlots('provider-1', 'service-1', '2026-07-05'); // Sunday

    expect(slots).toEqual([]);
  });

  it('excludes slots that overlap existing bookings', async () => {
    mockPrisma.service.findFirst.mockResolvedValue({
      id: 'service-1',
      durationMin: 30,
      provider: {
        id: 'provider-1',
        workingHours: {
          ...DEFAULT_WORKING_HOURS,
          mon: [{ start: '10:00', end: '12:00' }],
        },
      },
    });

    mockPrisma.booking.findMany.mockResolvedValue([
      {
        startTime: new Date(2026, 6, 6, 10, 0, 0, 0),
        endTime: new Date(2026, 6, 6, 10, 30, 0, 0),
      },
    ]);

    const slots = await generateAvailableSlots('provider-1', 'service-1', '2026-07-06');

    const blockedStart = new Date(2026, 6, 6, 10, 0, 0, 0).toISOString();
    expect(slots.some((slot) => slot.startTime === blockedStart)).toBe(false);
    expect(slots.length).toBeGreaterThan(0);
  });
});
