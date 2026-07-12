// ─── Entity Base ───────────────────────────────────────────────────────────────
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export interface User extends BaseEntity {
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
  department?: string
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer' | 'Admin' | 'Asset Manager' | 'Department Head' | 'Employee'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ─── Assets ────────────────────────────────────────────────────────────────────
export type AssetStatus = 'active' | 'in_use' | 'maintenance' | 'retired' | 'missing'
export type AssetCategory =
  | 'hardware'
  | 'software'
  | 'furniture'
  | 'vehicle'
  | 'equipment'
  | 'other'
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor'

export interface Asset extends BaseEntity {
  assetTag: string
  name: string
  category: AssetCategory
  status: AssetStatus
  condition: AssetCondition
  serialNumber?: string
  purchaseDate?: string
  purchasePrice?: number
  currentValue?: number
  location?: string
  assignedTo?: string
  assignedToUser?: User
  department?: string
  description?: string
  imageUrl?: string
  warrantyExpiry?: string
  vendor?: string
  invoiceNumber?: string
  maintenanceSchedule?: MaintenanceSchedule
}

// ─── Employees ─────────────────────────────────────────────────────────────────
export type EmployeeStatus = 'active' | 'on_leave' | 'terminated'

export interface Employee extends BaseEntity {
  employeeId: string
  name: string
  email: string
  phone?: string
  department: string
  designation: string
  status: EmployeeStatus
  managerId?: string
  manager?: Employee
  avatarUrl?: string
  joiningDate: string
  location?: string
  assignedAssets?: Asset[]
}

// ─── Bookings ──────────────────────────────────────────────────────────────────
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
export type BookingPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Booking extends BaseEntity {
  bookingNumber: string
  assetId: string
  asset?: Asset
  requestedBy: string
  requestedByUser?: User
  status: BookingStatus
  priority: BookingPriority
  startDate: string
  endDate: string
  purpose: string
  notes?: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
}

// ─── Maintenance ───────────────────────────────────────────────────────────────
export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'inspection'
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical'

export interface MaintenanceRecord extends BaseEntity {
  ticketNumber: string
  assetId: string
  asset?: Asset
  type: MaintenanceType
  status: MaintenanceStatus
  priority: MaintenancePriority
  title: string
  description: string
  assignedTechnician?: string
  assignedTechnicianUser?: User
  scheduledDate: string
  completedDate?: string
  estimatedCost?: number
  actualCost?: number
  notes?: string
  attachments?: string[]
}

export interface MaintenanceSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  lastServiceDate?: string
  nextServiceDate?: string
}

// ─── Dashboard / Analytics ─────────────────────────────────────────────────────
export interface DashboardStats {
  totalAssets: number
  activeAssets: number
  assetsInMaintenance: number
  pendingBookings: number
  totalEmployees: number
  assetsUtilizationRate: number
  maintenanceCostMTD: number
  overdueMaintenances: number
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

// ─── Pagination & Filters ──────────────────────────────────────────────────────
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  status?: string
  category?: string
  department?: string
  dateFrom?: string
  dateTo?: string
}

// ─── Navigation ────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
  children?: NavItem[]
  requiredRole?: UserRole[]
}

// ─── Notifications ─────────────────────────────────────────────────────────────
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification extends BaseEntity {
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
}

// ─── API Response ──────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  details?: Record<string, string[]>
}
