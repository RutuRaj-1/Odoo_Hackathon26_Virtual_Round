import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Users,
  Search,
  Plus,
  Mail,
  Building,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Edit,
  UserCheck
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { firestoreService } from '@/services/firestoreService'
import type { User, Department } from '@/types'
import { ROUTES } from '@/constants'
import { getInitials } from '@/utils'

export function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const unsubEmp = firestoreService.subscribeToEmployees(data => {
      setEmployees(data)
      setLoading(false)
    })
    const unsubDept = firestoreService.subscribeToDepartments(setDepartments)

    return () => {
      unsubEmp()
      unsubDept()
    }
  }, [])

  // Filter logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDept = deptFilter ? emp.departmentId === deptFilter : true
      const matchesRole = roleFilter ? emp.role === roleFilter : true
      const matchesStatus = statusFilter ? emp.status === statusFilter : true

      return matchesSearch && matchesDept && matchesRole && matchesStatus
    })
  }, [employees, searchTerm, deptFilter, roleFilter, statusFilter])

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage))
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredEmployees, currentPage])

  // Reset to first page on filter change
  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  const getDeptName = (id: string | null) => {
    if (!id) return 'Unassigned'
    return departments.find(d => d.departmentId === id)?.name || id
  }

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'Inactive':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Employees</h2>
          <p className="text-sm text-muted-foreground">Manage organization directory, roles, and resource access levels.</p>
        </div>
        <Button onClick={() => navigate(ROUTES.EMPLOYEE_CREATE)} className="gap-2 bg-primary hover:opacity-95 text-white">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Directory Content Table Wrapper */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-border flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              placeholder="Search employee..."
              className="pl-9 w-full bg-background"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => handleFilterChange(setDeptFilter, e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-primary min-w-[130px]"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.name}</option>)}
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => handleFilterChange(setRoleFilter, e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-primary min-w-[120px]"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Asset Manager">Asset Manager</option>
              <option value="Department Head">Department Head</option>
              <option value="Employee">Employee</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-primary min-w-[110px]"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
              <LoaderIcon className="h-6 w-6 animate-spin text-primary" />
              <span>Fetching employee catalog...</span>
            </div>
          ) : paginatedEmployees.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground text-base">No Employees Found</h3>
                <p className="text-xs">Adjust your search keyword or change filters to find what you are looking for.</p>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-foreground/80">
              <thead className="border-b border-border bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedEmployees.map((emp) => (
                  <tr key={emp.uid} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary text-xs font-semibold border border-primary/15">
                          {getInitials(emp.name)}
                        </div>
                        <span className="font-semibold text-foreground">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 opacity-60" />
                        <span>{emp.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/75">
                      <div className="flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 opacity-60 text-primary" />
                        <span>{getDeptName(emp.departmentId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground border border-border">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusStyle(emp.status)}`}>
                        {emp.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/employees/${emp.uid}`}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/employees/${emp.uid}/edit`}
                          className="p-1.5 text-muted-foreground hover:text-indigo-400 hover:bg-indigo-400/5 rounded-md transition-colors"
                          title="Edit Settings"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Panel */}
        {!loading && filteredEmployees.length > 0 && (
          <div className="flex items-center justify-between border-t border-border bg-muted/10 px-6 py-4">
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length}{' '}
              employees
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 text-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-xs"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
