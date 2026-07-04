import { z } from 'zod';
import { ValidationError } from '../types';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const timeRangeSchema = z.object({
  start: z.string().regex(timePattern, 'Start time must be in HH:MM format'),
  end: z.string().regex(timePattern, 'End time must be in HH:MM format'),
});

export const workingHoursSchema = z.object({
  mon: z.array(timeRangeSchema),
  tue: z.array(timeRangeSchema),
  wed: z.array(timeRangeSchema),
  thu: z.array(timeRangeSchema),
  fri: z.array(timeRangeSchema),
  sat: z.array(timeRangeSchema),
  sun: z.array(timeRangeSchema),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['CLIENT', 'PROVIDER']).default('CLIENT'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const paramIdSchema = z.string().min(1, 'Invalid ID');

export const serviceCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().max(500).optional(),
  durationMin: z.coerce.number().int().min(5, 'Duration must be at least 5 minutes').max(480),
  price: z.coerce.number().positive('Price must be positive'),
});

export const serviceUpdateSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    description: z.string().max(500).optional(),
    durationMin: z.coerce.number().int().min(5).max(480).optional(),
    price: z.coerce.number().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const updateProviderSchema = z
  .object({
    bio: z.string().max(500).optional(),
    workingHours: workingHoursSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const slotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  serviceId: z.string().min(1, 'Service ID is required'),
});

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  startTime: z.string().datetime({ message: 'startTime must be a valid ISO datetime' }),
});

export const bookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? 'Validation failed');
  }

  return parsed.data;
}

export function validateQuery<T>(schema: z.ZodSchema<T>, query: unknown): T {
  const parsed = schema.safeParse(query);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? 'Validation failed');
  }

  return parsed.data;
}

export function getParamId(params: { id?: string }, label = 'Resource'): string {
  const parsed = paramIdSchema.safeParse(params.id);

  if (!parsed.success) {
    throw new ValidationError(`Invalid ${label.toLowerCase()} ID`);
  }

  return parsed.data;
}
