import { createBrowserRouter, Navigate } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './guards'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ROUTES } from '@/constants'

// ─── Auth Pages ────────────────────────────────────────────────────────────────
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

// ─── App Pages ─────────────────────────────────────────────────────────────────
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { AssetsPage } from '@/pages/assets/AssetsPage'
import { AssetDetailPage } from '@/pages/assets/AssetDetailPage'
import { AssetFormPage } from '@/pages/assets/AssetFormPage'
import { EmployeesPage } from '@/pages/employees/EmployeesPage'
import { EmployeeDetailPage } from '@/pages/employees/EmployeeDetailPage'
import { EmployeeFormPage } from '@/pages/employees/EmployeeFormPage'
import { BookingsPage } from '@/pages/bookings/BookingsPage'
import { BookingDetailPage } from '@/pages/bookings/BookingDetailPage'
import { BookingFormPage } from '@/pages/bookings/BookingFormPage'
import { MaintenancePage } from '@/pages/maintenance/MaintenancePage'
import { MaintenanceDetailPage } from '@/pages/maintenance/MaintenanceDetailPage'
import { MaintenanceFormPage } from '@/pages/maintenance/MaintenanceFormPage'

// ─── Router ────────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },

  // ── Guest Routes (unauthenticated only) ──────────────────────────────────────
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <LoginPage /> },
          { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },

  // ── Protected Routes (authenticated only) ────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // Dashboard
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },

          // Assets
          { path: ROUTES.ASSETS, element: <AssetsPage /> },
          { path: ROUTES.ASSET_CREATE, element: <AssetFormPage /> },
          { path: ROUTES.ASSET_DETAIL, element: <AssetDetailPage /> },
          { path: ROUTES.ASSET_EDIT, element: <AssetFormPage /> },

          // Employees
          { path: ROUTES.EMPLOYEES, element: <EmployeesPage /> },
          { path: ROUTES.EMPLOYEE_CREATE, element: <EmployeeFormPage /> },
          { path: ROUTES.EMPLOYEE_DETAIL, element: <EmployeeDetailPage /> },
          { path: ROUTES.EMPLOYEE_EDIT, element: <EmployeeFormPage /> },

          // Bookings
          { path: ROUTES.BOOKINGS, element: <BookingsPage /> },
          { path: ROUTES.BOOKING_CREATE, element: <BookingFormPage /> },
          { path: ROUTES.BOOKING_DETAIL, element: <BookingDetailPage /> },

          // Maintenance
          { path: ROUTES.MAINTENANCE, element: <MaintenancePage /> },
          { path: ROUTES.MAINTENANCE_CREATE, element: <MaintenanceFormPage /> },
          { path: ROUTES.MAINTENANCE_DETAIL, element: <MaintenanceDetailPage /> },
        ],
      },
    ],
  },

  // ── Catch-all ────────────────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
])
