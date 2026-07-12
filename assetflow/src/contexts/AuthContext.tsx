import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthState, User, UserRole } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/firebase'

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

  // Synchronize with Firebase Auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const userData = docSnap.data()
            
            // Map capitalized roles (e.g. Employee) to lowercase code format if needed
            // But UserRole now supports both capitalized and lowercase roles in index.ts
            const mappedUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || 'Unnamed User',
              role: (userData.role as UserRole) || 'employee',
              avatarUrl: userData.avatarUrl || firebaseUser.photoURL || undefined,
              department: userData.department || undefined,
              createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            }

            const token = await firebaseUser.getIdToken()
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser))

            setState({
              user: mappedUser,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // If the document doesn't exist yet, we don't block the auth state mapping
            const mappedUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Unnamed User',
              role: 'employee',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }

            const token = await firebaseUser.getIdToken()
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser))

            setState({
              user: mappedUser,
              isAuthenticated: true,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Error synchronizing Firebase Auth with Firestore:', error)
          setState({ user: null, isAuthenticated: false, isLoading: false })
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        setState({ user: null, isAuthenticated: false, isLoading: false })
      }
    })

    return () => unsubscribe()
  }, [])

  /**
   * login - signs in via Firebase and immediately resolves state to prevent route redirect races.
   */
  const login = useCallback(async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const docRef = doc(db, 'users', firebaseUser.uid)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error('User profile does not exist in the database.')
    }

    const userData = docSnap.data()
    const mappedUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: userData.name || firebaseUser.displayName || 'Unnamed User',
      role: (userData.role as UserRole) || 'employee',
      avatarUrl: userData.avatarUrl || firebaseUser.photoURL || undefined,
      department: userData.department || undefined,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }

    const token = await firebaseUser.getIdToken()
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser))

    setState({
      user: mappedUser,
      isAuthenticated: true,
      isLoading: false,
    })
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
