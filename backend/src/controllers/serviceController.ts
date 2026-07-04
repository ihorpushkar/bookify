import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest, ForbiddenError } from '../types';
import {
  getParamId,
  paginationSchema,
  serviceCreateSchema,
  serviceUpdateSchema,
  ServiceCreateInput,
  ServiceUpdateInput,
  validateBody,
  validateQuery,
} from '../utils/validation';
import {
  assertServiceOwnership,
  getProviderProfileByUserId,
  serializeService,
} from '../utils/serviceHelpers';

export async function listServices(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit } = validateQuery(paginationSchema, req.query);
  const skip = (page - 1) * limit;

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        provider: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.service.count(),
  ]);

  res.json({
    success: true,
    data: services.map((service) => ({
      ...serializeService(service),
      provider: {
        id: service.provider.id,
        name: service.provider.user.name,
      },
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function createService(req: AuthRequest, res: Response): Promise<void> {
  if (!req.userId) {
    throw new ForbiddenError();
  }

  const data = validateBody<ServiceCreateInput>(serviceCreateSchema, req.body);
  const profile = await getProviderProfileByUserId(req.userId);

  const service = await prisma.service.create({
    data: {
      ...data,
      providerId: profile.id,
    },
  });

  res.status(201).json({
    success: true,
    data: serializeService(service),
  });
}

export async function updateService(req: AuthRequest, res: Response): Promise<void> {
  if (!req.userId) {
    throw new ForbiddenError();
  }

  const id = getParamId(req.params, 'Service');
  await assertServiceOwnership(id, req.userId);

  const data = validateBody<ServiceUpdateInput>(serviceUpdateSchema, req.body);

  const service = await prisma.service.update({
    where: { id },
    data,
  });

  res.json({
    success: true,
    data: serializeService(service),
  });
}

export async function deleteService(req: AuthRequest, res: Response): Promise<void> {
  if (!req.userId) {
    throw new ForbiddenError();
  }

  const id = getParamId(req.params, 'Service');
  await assertServiceOwnership(id, req.userId);

  await prisma.service.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Service deleted',
  });
}
