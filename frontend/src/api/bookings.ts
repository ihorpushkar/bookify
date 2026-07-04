import client from './client';
import type { ApiResponse, Booking, BookingStatus, PaginationMeta } from '../types';

export const bookingsAPI = {
  create: (serviceId: string, startTime: string) =>
    client.post<ApiResponse<Booking>>('/bookings', { serviceId, startTime }),

  getMine: (page = 1, limit = 20) =>
    client.get<ApiResponse<Booking[]> & { meta: PaginationMeta }>('/bookings/me', {
      params: { page, limit },
    }),

  getIncoming: (page = 1, limit = 20) =>
    client.get<ApiResponse<Booking[]> & { meta: PaginationMeta }>('/bookings/incoming', {
      params: { page, limit },
    }),

  updateStatus: (id: string, status: BookingStatus) =>
    client.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status }),
};
