import { createBrowserRouter, Navigate } from 'react-router-dom'
import {
  GuestRoute,
  ProtectedRoute,
  RoleDashboardRedirect,
  AdminRoute,
  AssetManagerRoute,
  DepartmentHeadRoute,
  EmployeeRoute
} from './guards'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ROUTES } from '@/constants'

// ─── Auth Pages ────────────────────────────────────────────────────────────────
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage'

// ─── Admin Pages ───────────────────────────────────────────────────────────────
import { OrganizationPage } from '@/pages/admin/organization/OrganizationPage'

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
import { LandingPage } from '@/pages/LandingPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

// ─── Router ────────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Root
  {
    path: '/',
    element: <LandingPage />,
  },

  // ── Guest Routes (unauthenticated only) ──────────────────────────────────────
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <LoginPage /> },
          { path: ROUTES.SIGNUP, element: <SignupPage /> },
          { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },

  // ── Protected Routes (authenticated only) ────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      // Central Dashboard Redirector
      { path: ROUTES.DASHBOARD, element: <RoleDashboardRedirect /> },

      // Standalone Unauthorized Page
      { path: '/unauthorized', element: <UnauthorizedPage /> },

      // ── Admin-Only Routes ──
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/admin/dashboard', element: <DashboardPage /> },
              { path: '/admin/organization', element: <OrganizationPage /> },
            ],
          },
        ],
      },

      // ── Asset Manager-Only Routes ──
      {
        element: <AssetManagerRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/asset-manager/dashboard', element: <DashboardPage /> },
            ],
          },
        ],
      },

      // ── Department Head-Only Routes ──
      {
        element: <DepartmentHeadRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/department/dashboard', element: <DashboardPage /> },
            ],
          },
        ],
      },

      // ── Employee-Only Routes ──
      {
        element: <EmployeeRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/employee/dashboard', element: <DashboardPage /> },
            ],
          },
        ],
      },

      // ── General Shared Pages (Wrapped in general AppLayout) ──
      {
        element: <AppLayout />,
        children: [
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

          // Settings
          { path: ROUTES.SETTINGS, element: <SettingsPage /> },
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
