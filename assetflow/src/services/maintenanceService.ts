import { http } from './http'
import type { MaintenanceRecord, PaginatedResponse, FilterParams, PaginationParams } from '@/types'
import { buildQueryString } from '@/utils'

export const maintenanceService = {
  getAll: (params?: FilterParams & PaginationParams) =>
    http.get<PaginatedResponse<MaintenanceRecord>>(
      `/maintenance?${buildQueryString(params ?? {})}`,
    ),

  getById: (id: string) => http.get<MaintenanceRecord>(`/maintenance/${id}`),

  create: (data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'ticketNumber'>) =>
    http.post<MaintenanceRecord>('/maintenance', data),

  update: (id: string, data: Partial<MaintenanceRecord>) =>
    http.patch<MaintenanceRecord>(`/maintenance/${id}`, data),

  complete: (id: string, actualCost?: number) =>
    http.patch<MaintenanceRecord>(`/maintenance/${id}/complete`, { actualCost }),

  delete: (id: string) => http.delete<void>(`/maintenance/${id}`),
}
