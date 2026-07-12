import type { ApiError, ApiResponse } from '@/types'

// ─── Base HTTP Client ──────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('assetflow_auth_token')

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      message: res.statusText,
      statusCode: res.status,
    }))
    throw error
  }

  return res.json() as Promise<ApiResponse<T>>
}

// ─── HTTP Method Helpers ───────────────────────────────────────────────────────
export const http = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),

  post: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
}
