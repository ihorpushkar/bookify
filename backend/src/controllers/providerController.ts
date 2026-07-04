import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest, ForbiddenError, NotFoundError } from '../types';
import {
  getParamId,
  updateProviderSchema,
  UpdateProviderInput,
  validateBody,
} from '../utils/validation';
import { getProviderProfileByUserId, serializeService } from '../utils/serviceHelpers';

export async function getProvider(req: AuthRequest, res: Response): Promise<void> {
  const id = getParamId(req.params, 'Provider');

  const provider = await prisma.providerProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      services: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  res.json({
    success: true,
    data: {
      id: provider.id,
      bio: provider.bio,
      workingHours: provider.workingHours,
      provider: provider.user,
      services: provider.services.map(serializeService),
    },
  });
}

export async function updateMyProviderProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.userId) {
    throw new ForbiddenError();
  }

  const data = validateBody<UpdateProviderInput>(updateProviderSchema, req.body);
  const profile = await getProviderProfileByUserId(req.userId);

  const updated = await prisma.providerProfile.update({
    where: { id: profile.id },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      services: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  res.json({
    success: true,
    data: {
      id: updated.id,
      bio: updated.bio,
      workingHours: updated.workingHours,
      provider: updated.user,
      services: updated.services.map(serializeService),
    },
  });
}
