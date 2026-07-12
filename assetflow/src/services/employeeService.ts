import { http } from './http'
import type { Employee, PaginatedResponse, FilterParams, PaginationParams } from '@/types'
import { buildQueryString } from '@/utils'

export const employeeService = {
  getAll: (params?: FilterParams & PaginationParams) =>
    http.get<PaginatedResponse<Employee>>(`/employees?${buildQueryString(params ?? {})}`),

  getById: (id: string) => http.get<Employee>(`/employees/${id}`),

  create: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) =>
    http.post<Employee>('/employees', data),

  update: (id: string, data: Partial<Employee>) =>
    http.patch<Employee>(`/employees/${id}`, data),

  delete: (id: string) => http.delete<void>(`/employees/${id}`),
}
