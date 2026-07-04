import client from './client';
import type { ApiResponse, PaginationMeta, Service } from '../types';

export const servicesAPI = {
  list: (page = 1, limit = 10) =>
    client.get<ApiResponse<Service[]> & { meta: PaginationMeta }>('/services', {
      params: { page, limit },
    }),

  create: (data: {
    name: string;
    description?: string;
    durationMin: number;
    price: number;
  }) => client.post<ApiResponse<Service>>('/services', data),

  update: (
    id: string,
    data: Partial<{ name: string; description?: string; durationMin: number; price: number }>,
  ) => client.patch<ApiResponse<Service>>(`/services/${id}`, data),

  remove: (id: string) => client.delete<{ success: boolean; message: string }>(`/services/${id}`),
};
