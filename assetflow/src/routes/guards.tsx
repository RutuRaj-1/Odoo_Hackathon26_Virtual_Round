import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

// ─── Case-Insensitive Role Normalizer Helpers ─────────────────────────────────
export function isAdmin(role?: string | null): boolean {
  if (!role) return false
  const r = role.toLowerCase().replace(/[\s_-]/g, '')
  return r === 'admin'
}

export function isAssetManager(role?: string | null): boolean {
  if (!role) return false
  const r = role.toLowerCase().replace(/[\s_-]/g, '')
  return r === 'assetmanager' || r === 'manager'
}

export function isDepartmentHead(role?: string | null): boolean {
  if (!role) return false
  const r = role.toLowerCase().replace(/[\s_-]/g, '')
  return r === 'departmenthead' || r === 'head'
}

export function isEmployee(role?: string | null): boolean {
  if (!role) return false
  const r = role.toLowerCase().replace(/[\s_-]/g, '')
  return r === 'employee'
}

// ─── Protected Route ───────────────────────────────────────────────────────────
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

// ─── Guest Route ───────────────────────────────────────────────────────────────
export function GuestRoute() {
  const { uid, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
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
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (uid === null) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (isAdmin(role)) {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (isAssetManager(role)) {
    return <Navigate to="/asset-manager/dashboard" replace />
  }
  if (isDepartmentHead(role)) {
    return <Navigate to="/department/dashboard" replace />
  }
  
  return <Navigate to="/employee/dashboard" replace />
}

// ─── Role-Based Guards ──────────────────────────────────────────────────────────
export function AdminRoute() {
  const { uid, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (uid === null) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!isAdmin(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export function AssetManagerRoute() {
  const { uid, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (uid === null) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!isAssetManager(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export function DepartmentHeadRoute() {
  const { uid, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (uid === null) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!isDepartmentHead(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export function EmployeeRoute() {
  const { uid, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (uid === null) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!isEmployee(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
