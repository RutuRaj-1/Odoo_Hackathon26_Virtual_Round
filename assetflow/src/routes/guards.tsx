import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

// ─── Protected Route ───────────────────────────────────────────────────────────
/**
 * Wraps routes that require authentication.
 * Redirects to /login with the attempted URL saved in state.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

// ─── Guest Route ───────────────────────────────────────────────────────────────
/**
 * Wraps routes that should only be accessible to unauthenticated users.
 * Redirects authenticated users to the dashboard.
 */
export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
