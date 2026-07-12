import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { User, UserRole } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/firebase'
import { authService } from '@/services/authService'
import type { SignupPayload, AuthResult } from '@/services/authService'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface AuthContextValue {
  uid: string | null
  email: string | null
  role: UserRole | null
  departmentId: string | null
  status: 'Active' | 'Inactive' | null
  displayName: string | null
  loading: boolean
  currentUser: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (payload: SignupPayload) => Promise<AuthResult>
  updateUser: (user: Partial<User>) => void
}

interface AuthState {
  user: User | null
  isLoading: boolean
}

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
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
            
            const mappedUser: User = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || 'Unnamed User',
              role: (userData.role as UserRole) || 'Employee',
              departmentId: userData.departmentId || null,
              status: (userData.status as 'Active' | 'Inactive') || 'Active',
              createdAt: userData.createdAt,
              avatarUrl: userData.avatarUrl || firebaseUser.photoURL || undefined,
            }

            const token = await firebaseUser.getIdToken()
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser))

            setState({
              user: mappedUser,
              isLoading: false,
            })
          } else {
            // User doc doesn't exist in Firestore yet (will be created in signup/google login)
            const mappedUser: User = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Unnamed User',
              role: 'Employee',
              departmentId: null,
              status: 'Active',
              createdAt: new Date().toISOString(),
            }

            const token = await firebaseUser.getIdToken()
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser))

            setState({
              user: mappedUser,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Error synchronizing Firebase Auth with Firestore:', error)
          setState({ user: null, isLoading: false })
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        setState({ user: null, isLoading: false })
      }
    })

    return () => unsubscribe()
  }, [])

  /**
   * login - signs in via Firebase Auth and immediately resolves state.
   */
  const login = useCallback(async (email: string, password?: string) => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      let firebaseUser = auth.currentUser

      // Sign in if there is no active user session, or if email and password are provided
      if (!firebaseUser || (email && password)) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password || '')
        firebaseUser = userCredential.user
      }

      const docRef = doc(db, 'users', firebaseUser.uid)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        throw new Error('User profile does not exist in the database.')
      }

      const userData = docSnap.data()
      const mappedUser: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData.name || firebaseUser.displayName || 'Unnamed User',
        role: (userData.role as UserRole) || 'Employee',
        departmentId: userData.departmentId || null,
        status: (userData.status as 'Active' | 'Inactive') || 'Active',
        createdAt: userData.createdAt,
        avatarUrl: userData.avatarUrl || firebaseUser.photoURL || undefined,
      }

      const token = await firebaseUser.getIdToken()
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser))

      setState({
        user: mappedUser,
        isLoading: false,
      })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error;
    }
  }, [])

  /**
   * signup - creates user in Auth and Firestore
   */
  const signup = useCallback(async (payload: SignupPayload) => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const result = await authService.signup(payload)
      
      const mappedUser: User = {
        id: result.user.id,
        uid: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        departmentId: null,
        status: 'Active',
      }

      setState({
        user: mappedUser,
        isLoading: false,
      })

      return result
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [])

  /**
   * logout - signs out the user
   */
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      await authService.logout()
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      setState({ user: null, isLoading: false })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [])

  /**
   * updateUser - updates local state profile values
   */
  const updateUser = useCallback((updates: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev
      const updated = { ...prev.user, ...updates }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated))
      return { ...prev, user: updated }
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        uid: state.user?.id || null,
        email: state.user?.email || null,
        role: state.user?.role || null,
        departmentId: state.user?.departmentId || null,
        status: state.user?.status || null,
        displayName: state.user?.name || null,
        loading: state.isLoading,
        currentUser: state.user,
        login,
        logout,
        signup,
        updateUser,
      }}
    >
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
