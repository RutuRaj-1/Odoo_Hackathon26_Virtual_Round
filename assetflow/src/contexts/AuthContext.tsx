import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthState, User } from '@/types'
import { STORAGE_KEYS } from '@/constants'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER)
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (stored && token) {
      setState({ user: JSON.parse(stored) as User, isAuthenticated: true, isLoading: false })
    } else {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = useCallback(async (email: string, _password: string) => {
    // TODO: replace with actual API call
    const mockUser: User = {
      id: '1',
      email,
      name: 'Akhil Admin',
      role: 'admin',
      department: 'Information Technology',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token')
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser))
    setState({ user: mockUser, isAuthenticated: true, isLoading: false })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    setState({ user: null, isAuthenticated: false, isLoading: false })
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev
      const updated = { ...prev.user, ...updates }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated))
      return { ...prev, user: updated }
    })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
