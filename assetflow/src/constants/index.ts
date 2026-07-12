// ─── App Constants ─────────────────────────────────────────────────────────────
export const APP_NAME = 'AssetFlow'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Enterprise Asset & Resource Management'

// ─── Route Paths ───────────────────────────────────────────────────────────────
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Assets
  ASSETS: '/assets',
  ASSET_DETAIL: '/assets/:id',
  ASSET_CREATE: '/assets/new',
  ASSET_EDIT: '/assets/:id/edit',

  // Employees
  EMPLOYEES: '/employees',
  EMPLOYEE_DETAIL: '/employees/:id',
  EMPLOYEE_CREATE: '/employees/new',
  EMPLOYEE_EDIT: '/employees/:id/edit',

  // Bookings
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: '/bookings/:id',
  BOOKING_CREATE: '/bookings/new',

  // Maintenance
  MAINTENANCE: '/maintenance',
  MAINTENANCE_DETAIL: '/maintenance/:id',
  MAINTENANCE_CREATE: '/maintenance/new',

  // Settings
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const

// ─── Pagination ────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// ─── Asset Constants ───────────────────────────────────────────────────────────
export const ASSET_CATEGORIES = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' },
] as const

export const ASSET_STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'in_use', label: 'In Use', color: 'blue' },
  { value: 'maintenance', label: 'Maintenance', color: 'yellow' },
  { value: 'retired', label: 'Retired', color: 'gray' },
  { value: 'missing', label: 'Missing', color: 'red' },
] as const

export const ASSET_CONDITIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
] as const

// ─── Booking Constants ─────────────────────────────────────────────────────────
export const BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
  { value: 'completed', label: 'Completed', color: 'blue' },
] as const

export const BOOKING_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const

// ─── Maintenance Constants ─────────────────────────────────────────────────────
export const MAINTENANCE_TYPES = [
  { value: 'preventive', label: 'Preventive' },
  { value: 'corrective', label: 'Corrective' },
  { value: 'predictive', label: 'Predictive' },
  { value: 'inspection', label: 'Inspection' },
] as const

export const MAINTENANCE_STATUSES = [
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'in_progress', label: 'In Progress', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'overdue', label: 'Overdue', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
] as const

export const MAINTENANCE_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'yellow' },
  { value: 'critical', label: 'Critical', color: 'red' },
] as const

// ─── User Roles ────────────────────────────────────────────────────────────────
export const USER_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
  { value: 'viewer', label: 'Viewer' },
] as const

// ─── Departments ───────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  'Engineering',
  'Finance',
  'Human Resources',
  'Information Technology',
  'Legal',
  'Marketing',
  'Operations',
  'Product',
  'Sales',
  'Support',
] as const

// ─── Local Storage Keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'assetflow_auth_token',
  USER: 'assetflow_user',
  SIDEBAR_COLLAPSED: 'assetflow_sidebar_collapsed',
  THEME: 'assetflow_theme',
} as const

// ─── Query Keys ────────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  ASSETS: 'assets',
  ASSET: 'asset',
  EMPLOYEES: 'employees',
  EMPLOYEE: 'employee',
  BOOKINGS: 'bookings',
  BOOKING: 'booking',
  MAINTENANCE: 'maintenance',
  MAINTENANCE_RECORD: 'maintenance_record',
  DASHBOARD_STATS: 'dashboard_stats',
  NOTIFICATIONS: 'notifications',
  CURRENT_USER: 'current_user',
} as const
