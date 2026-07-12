import { http } from './http'
import type { Asset, PaginatedResponse, FilterParams, PaginationParams } from '@/types'
import { buildQueryString } from '@/utils'

// ─── Asset Service ─────────────────────────────────────────────────────────────
export const assetService = {
  getAll: (params?: FilterParams & PaginationParams) =>
    http.get<PaginatedResponse<Asset>>(`/assets?${buildQueryString(params ?? {})}`),

  getById: (id: string) => http.get<Asset>(`/assets/${id}`),

  create: (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) =>
    http.post<Asset>('/assets', data),

  update: (id: string, data: Partial<Asset>) => http.patch<Asset>(`/assets/${id}`, data),

  delete: (id: string) => http.delete<void>(`/assets/${id}`),
}
