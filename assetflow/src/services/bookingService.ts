import { http } from './http'
import type { Booking, PaginatedResponse, FilterParams, PaginationParams } from '@/types'
import { buildQueryString } from '@/utils'

export const bookingService = {
  getAll: (params?: FilterParams & PaginationParams) =>
    http.get<PaginatedResponse<Booking>>(`/bookings?${buildQueryString(params ?? {})}`),

  getById: (id: string) => http.get<Booking>(`/bookings/${id}`),

  create: (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'bookingNumber'>) =>
    http.post<Booking>('/bookings', data),

  approve: (id: string) => http.patch<Booking>(`/bookings/${id}/approve`, {}),

  reject: (id: string, reason: string) =>
    http.patch<Booking>(`/bookings/${id}/reject`, { rejectionReason: reason }),

  cancel: (id: string) => http.patch<Booking>(`/bookings/${id}/cancel`, {}),
}
