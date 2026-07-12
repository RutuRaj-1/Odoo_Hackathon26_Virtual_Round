// ─── Entity Base ───────────────────────────────────────────────────────────────
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  uid: string
  name: string
  email: string
  role: UserRole
  departmentId: string | null
  status: 'Active' | 'Inactive'
  createdAt?: any
}

export type UserRole = 'Admin' | 'Asset Manager' | 'Department Head' | 'Employee' | 'admin' | 'manager' | 'employee' | 'viewer'

export interface Department {
  departmentId: string
  name: string
  departmentCode: string
  parentDepartment: string | null
  headId: string | null
  status: 'Active' | 'Inactive'
  createdAt?: any
  updatedAt?: any
}

export interface AssetCategoryDoc {
  categoryId: string
  name: string
  description: string
  warrantyPeriod: string | number
  status: 'Active' | 'Inactive'
  createdAt?: any
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ─── Assets ────────────────────────────────────────────────────────────────────
export type AssetStatus = 'Available' | 'Allocated' | 'Reserved' | 'Under Maintenance' | 'Lost' | 'Retired' | 'Disposed'
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor'

export interface Asset {
  assetId: string
  assetTag: string
  assetName: string
  serialNumber: string
  categoryId: string
  departmentId: string | null
  status: AssetStatus
  location: string
  condition: AssetCondition
  purchaseDate: string
  purchaseCost: number
  assignedTo: string | null
  createdBy: string
  createdAt?: any
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
