import prisma from '../config/database';
import { ForbiddenError, NotFoundError } from '../types';

export async function getProviderProfileByUserId(userId: string) {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ForbiddenError('Provider profile not found');
  }

  return profile;
}

export async function assertServiceOwnership(serviceId: string, userId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      provider: {
        select: { userId: true },
      },
    },
  });

  if (!service) {
    throw new NotFoundError('Service not found');
  }

  if (service.provider.userId !== userId) {
    throw new ForbiddenError('You can only manage your own services');
  }

  return service;
}

export function serializeService<T extends { price: { toNumber(): number } | number | string }>(
  service: T,
) {
  return {
    ...service,
    price: typeof service.price === 'object' && 'toNumber' in service.price
      ? service.price.toNumber()
      : Number(service.price),
  };
}
