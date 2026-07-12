import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

// ─── Protected Route (Requires authentication) ─────────────────────────────────
export function ProtectedRoute() {
  const { uid, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (uid === null) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

// ─── Guest Route (Requires unauthenticated status) ────────────────────────────
export function GuestRoute() {
  const { uid, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (uid !== null) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

// ─── Role Dashboard Redirect ───────────────────────────────────────────────────
export function RoleDashboardRedirect() {
  const { role, loading, uid } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (uid === null) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Redirect based on the Firestore user role
  switch (role) {
    case 'Admin':
      return <Navigate to="/admin/dashboard" replace />
    case 'Asset Manager':
      return <Navigate to="/asset-manager/dashboard" replace />
    case 'Department Head':
      return <Navigate to="/department/dashboard" replace />
    case 'Employee':
    default:
      return <Navigate to="/employee/dashboard" replace />
  }
}

// ─── Role-Based Guards ──────────────────────────────────────────────────────────
export function AdminRoute() {
  const { uid, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (uid === null) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (role !== 'Admin') {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export function AssetManagerRoute() {
  const { uid, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (uid === null) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (role !== 'Asset Manager') {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export function DepartmentHeadRoute() {
  const { uid, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (uid === null) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (role !== 'Department Head') {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export function EmployeeRoute() {
  const { uid, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (uid === null) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (role !== 'Employee') {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
