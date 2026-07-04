import client from './client';
import type { ApiResponse, ProviderDetail, Slot, WorkingHours } from '../types';

export const providersAPI = {
  getById: (id: string) => client.get<ApiResponse<ProviderDetail>>(`/providers/${id}`),

  getSlots: (id: string, date: string, serviceId: string) =>
    client.get<ApiResponse<{ date: string; serviceId: string; slots: Slot[] }>>(
      `/providers/${id}/slots`,
      { params: { date, serviceId } },
    ),

  updateMe: (data: { bio?: string; workingHours?: WorkingHours }) =>
    client.patch<ApiResponse<ProviderDetail>>('/providers/me', data),
};
