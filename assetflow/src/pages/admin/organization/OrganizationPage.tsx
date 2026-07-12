import { useEffect, useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Building,
  FolderOpen,
  Users,
  ShieldCheck,
  Building2,
  Inbox
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { useToast } from '@/components/ui/toast'
import { firestoreService } from '@/services/firestoreService'
import type { Department, AssetCategoryDoc, User, UserRole } from '@/types'
import { getInitials } from '@/utils'
import { useAuth } from '@/hooks/useAuth'

export function OrganizationPage() {
  const { toast } = useToast()
  const { currentUser } = useAuth()
  
  // Data States
  const [departments, setDepartments] = useState<Department[]>([])
  const [categories, setCategories] = useState<AssetCategoryDoc[]>([])
  const [employees, setEmployees] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Modals States
  const [deptModal, setDeptModal] = useState<{ open: boolean; editId?: string; data: Omit<Department, 'departmentId' | 'createdAt' | 'updatedAt'> }>({
    open: false,
    data: { name: '', departmentCode: '', parentDepartment: null, headId: null, status: 'Active' }
  })
  
  const [catModal, setCatModal] = useState<{ open: boolean; editId?: string; data: Omit<AssetCategoryDoc, 'categoryId' | 'createdAt'> }>({
    open: false,
    data: { name: '', description: '', warrantyPeriod: '', status: 'Active' }
  })

  const [promoModal, setPromoModal] = useState<{ open: boolean; user?: User; role: UserRole; departmentId: string | null; status: 'Active' | 'Inactive' }>({
    open: false,
    role: 'Employee',
    departmentId: null,
    status: 'Active'
  })

  // Directory Search/Filters/Pagination States
  const [deptSearchTerm, setDeptSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    const unsubscribeDept = firestoreService.subscribeToDepartments((data) => {
      setDepartments(data)
    })
    const unsubscribeCat = firestoreService.subscribeToCategories((data) => {
      setCategories(data)
    })
    const unsubscribeEmp = firestoreService.subscribeToEmployees((data) => {
      setEmployees(data)
      setLoading(false)
    })
    return () => {
      unsubscribeDept()
      unsubscribeCat()
      unsubscribeEmp()
    }
  }, [])

  // ─── Department Operations ─────────────────────────────────────────────────────
  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptModal.data.name.trim() || !deptModal.data.departmentCode.trim()) {
      toast({ variant: 'error', title: 'Validation Error', description: 'Name and Code are required.' })
      return
    }

    try {
      if (deptModal.editId) {
        await firestoreService.updateDepartment(deptModal.editId, deptModal.data)
        toast({ variant: 'success', title: 'Department Updated', description: 'Changes saved successfully.' })
      } else {
        await firestoreService.createDepartment(deptModal.data)
        toast({ variant: 'success', title: 'Department Created', description: 'New department added successfully.' })
      }
      setDeptModal({ open: false, data: { name: '', departmentCode: '', parentDepartment: null, headId: null, status: 'Active' } })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Operation Failed', description: error.message })
    }
  }

  const handleDeptDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return
    try {
      await firestoreService.deleteDepartment(id)
      toast({ variant: 'success', title: 'Department Deleted', description: 'Deleted department successfully.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Delete Failed', description: error.message })
    }
  }

  // ─── Category Operations ───────────────────────────────────────────────────────
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catModal.data.name.trim() || !catModal.data.warrantyPeriod) {
      toast({ variant: 'error', title: 'Validation Error', description: 'Name and Warranty Period are required.' })
      return
    }

    try {
      if (catModal.editId) {
        await firestoreService.updateCategory(catModal.editId, catModal.data)
        toast({ variant: 'success', title: 'Category Updated', description: 'Changes saved successfully.' })
      } else {
        await firestoreService.createCategory(catModal.data)
        toast({ variant: 'success', title: 'Category Created', description: 'New asset category added successfully.' })
      }
      setCatModal({ open: false, data: { name: '', description: '', warrantyPeriod: '', status: 'Active' } })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Operation Failed', description: error.message })
    }
  }

  const handleCatDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await firestoreService.deleteCategory(id)
      toast({ variant: 'success', title: 'Category Deleted', description: 'Deleted category successfully.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Delete Failed', description: error.message })
    }
  }

  // ─── Promotion / Employee Directory Operations ─────────────────────────────────
  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoModal.user) return

    if (currentUser?.uid === promoModal.user.uid && promoModal.role !== promoModal.user.role) {
      toast({ variant: 'error', title: 'Action Denied', description: 'You cannot change your own role.' })
      return
    }

    try {
      await firestoreService.updateEmployeeRoleAndDepartment(promoModal.user.uid, {
        role: promoModal.role,
        departmentId: promoModal.departmentId,
        status: promoModal.status
      })
      toast({
        variant: 'success',
        title: 'Employee Profile Updated',
        description: `Successfully updated settings for ${promoModal.user.name}.`
      })
      setPromoModal({ open: false, role: 'Employee', departmentId: null, status: 'Active' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Update Failed', description: error.message })
    }
  }

  // Directory Filtering
  const filteredDepartments = departments.filter((dept) => {
    return dept.name.toLowerCase().includes(deptSearchTerm.toLowerCase()) ||
           dept.departmentCode.toLowerCase().includes(deptSearchTerm.toLowerCase())
  })

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !roleFilter || emp.role === roleFilter
    const matchesStatus = !statusFilter || emp.status === statusFilter
    const matchesDept = !deptFilter || emp.departmentId === deptFilter
    return matchesSearch && matchesRole && matchesStatus && matchesDept
  })

  // Pagination Helper
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage))
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getDepartmentName = (deptId?: string | null) => {
    if (!deptId) return 'Unassigned'
    return departments.find((d) => d.departmentId === deptId)?.name || 'Unassigned'
  }

  const getUserName = (userId?: string | null) => {
    if (!userId) return 'Unassigned'
    return employees.find((e) => e.uid === userId || e.id === userId)?.name || 'Unassigned'
  }

  if (loading && employees.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Organization Setup</h2>
        <p className="text-sm text-muted-foreground">
          Maintain departments, asset categories, and control user access profiles.
        </p>
      </div>

      <Tabs defaultValue="departments" className="w-full space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-[#E2E8F0] dark:bg-[#111827] border border-border p-1 rounded-xl">
          <TabsTrigger value="departments" className="gap-2 text-xs font-bold uppercase py-2">
            <Building className="h-3.5 w-3.5" /> Departments
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2 text-xs font-bold uppercase py-2">
            <FolderOpen className="h-3.5 w-3.5" /> Categories
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2 text-xs font-bold uppercase py-2">
            <Users className="h-3.5 w-3.5" /> Employees
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB A: DEPARTMENTS ─── */}
        <TabsContent value="departments" className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search department..."
                value={deptSearchTerm}
                onChange={(e) => setDeptSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary hover:border-border/80 transition-all font-medium"
              />
            </div>
            <Button
              onClick={() =>
                setDeptModal({
                  open: true,
                  data: { name: '', departmentCode: '', parentDepartment: null, headId: null, status: 'Active' }
                })
              }
              className="gap-2 bg-primary text-white hover:opacity-95 shrink-0"
            >
              <Plus className="h-4 w-4" /> Add Department
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-foreground/80">
              <thead className="border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground/90 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Parent Department</th>
                  <th className="px-6 py-4">Department Head</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <Inbox className="h-6 w-6 text-primary" />
                        <span className="font-semibold text-foreground text-sm">No Departments</span>
                        <p className="text-xs">Configure your organizational structure by adding a department.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => (
                    <tr key={dept.departmentId} className="hover:bg-muted/10 transition-colors duration-150">
                      <td className="px-6 py-4 font-mono font-bold text-primary">{dept.departmentCode}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{dept.name}</td>
                      <td className="px-6 py-4 text-foreground/75">{getDepartmentName(dept.parentDepartment)}</td>
                      <td className="px-6 py-4 text-foreground/75">{getUserName(dept.headId)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            dept.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setDeptModal({ open: true, editId: dept.departmentId, data: { ...dept } })}
                            className="p-2 text-muted-foreground hover:text-indigo-400 hover:bg-indigo-400/5 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeptDelete(dept.departmentId)}
                            className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ─── TAB B: CATEGORIES ─── */}
        <TabsContent value="categories" className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-end">
            <Button
              onClick={() =>
                setCatModal({
                  open: true,
                  data: { name: '', description: '', warrantyPeriod: '', status: 'Active' }
                })
              }
              className="gap-2 bg-primary text-white hover:opacity-95"
            >
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-foreground/80">
              <thead className="border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground/90 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Warranty Period</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <FolderOpen className="h-6 w-6 text-primary" />
                        <span className="font-semibold text-foreground text-sm">No Categories</span>
                        <p className="text-xs">Add an asset category to group your organization hardware.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.categoryId} className="hover:bg-muted/10 transition-colors duration-150">
                      <td className="px-6 py-4 font-semibold text-foreground">{cat.name}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-foreground/70">{cat.description || '—'}</td>
                      <td className="px-6 py-4 text-foreground/75 font-mono">{cat.warrantyPeriod} Months</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            cat.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}
                        >
                          {cat.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setCatModal({ open: true, editId: cat.categoryId, data: { ...cat } })}
                            className="p-2 text-muted-foreground hover:text-indigo-400 hover:bg-indigo-400/5 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCatDelete(cat.categoryId)}
                            className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ─── TAB C: EMPLOYEES ─── */}
        <TabsContent value="employees" className="space-y-6 animate-in fade-in duration-200">
          {/* Filters Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="lg:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Search employee</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary hover:border-border/80 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground font-medium hover:border-border/80 transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground font-medium hover:border-border/80 transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Asset Manager">Asset Manager</option>
                <option value="Department Head">Department Head</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground font-medium hover:border-border/80 transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-foreground/80">
              <thead className="border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground/90 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <Users className="h-6 w-6 text-primary" />
                        <span className="font-semibold text-foreground text-sm">No Employees</span>
                        <p className="text-xs">No personnel matched your search parameters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp) => (
                    <tr key={emp.uid} className="hover:bg-muted/10 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary text-xs font-bold border border-primary/15">
                            {getInitials(emp.name)}
                          </div>
                          <span className="font-bold text-foreground text-sm">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-semibold">{emp.email}</td>
                      <td className="px-6 py-4 text-foreground/75">{getDepartmentName(emp.departmentId)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-foreground border border-border">
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            emp.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            setPromoModal({
                              open: true,
                              user: emp,
                              role: emp.role,
                              departmentId: emp.departmentId || null,
                              status: emp.status || 'Active'
                            })
                          }
                          className="flex items-center gap-1.5 ml-auto text-xs font-bold text-primary hover:bg-primary/5 border border-primary/20 hover:border-primary/45 px-3 py-2 rounded-lg transition-all"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> Adjust Role
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredEmployees.length > 0 && (
              <div className="flex items-center justify-between border-t border-border bg-muted/10 px-6 py-4">
                <span className="text-xs text-muted-foreground font-medium">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length}{' '}
                  records
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3 text-xs"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 text-xs"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── MODAL A: DEPARTMENT CREATE/EDIT ─── */}
      {deptModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-base font-bold text-foreground">
                {deptModal.editId ? 'Edit Department' : 'Create Department'}
              </h3>
              <button
                onClick={() => setDeptModal({ open: false, data: { name: '', departmentCode: '', parentDepartment: null, headId: null, status: 'Active' } })}
                className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <FormField id="dept-name" label="Department Name" required>
                <Input
                  id="dept-name"
                  value={deptModal.data.name}
                  onChange={(e) => setDeptModal((m) => ({ ...m, data: { ...m.data, name: e.target.value } }))}
                  placeholder="e.g. Engineering"
                />
              </FormField>

              <FormField id="dept-code" label="Department Code" required>
                <Input
                  id="dept-code"
                  value={deptModal.data.departmentCode}
                  onChange={(e) => setDeptModal((m) => ({ ...m, data: { ...m.data, departmentCode: e.target.value } }))}
                  placeholder="e.g. ENG"
                />
              </FormField>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Parent Department</label>
                <select
                  value={deptModal.data.parentDepartment || ''}
                  onChange={(e) =>
                    setDeptModal((m) => ({
                      ...m,
                      data: { ...m.data, parentDepartment: e.target.value || null }
                    }))
                  }
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-border/80 transition-all font-medium"
                >
                  <option value="">None (Top-Level)</option>
                  {departments
                    .filter((d) => d.departmentId !== deptModal.editId)
                    .map((d) => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Department Head</label>
                <select
                  value={deptModal.data.headId || ''}
                  onChange={(e) =>
                    setDeptModal((m) => ({
                      ...m,
                      data: { ...m.data, headId: e.target.value || null }
                    }))
                  }
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-border/80 transition-all font-medium"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.uid} value={emp.uid}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Status</label>
                <select
                  value={deptModal.data.status}
                  onChange={(e) =>
                    setDeptModal((m) => ({
                      ...m,
                      data: { ...m.data, status: e.target.value as 'Active' | 'Inactive' }
                    }))
                  }
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-border/80 transition-all font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-muted"
                  onClick={() => setDeptModal({ open: false, data: { name: '', departmentCode: '', parentDepartment: null, headId: null, status: 'Active' } })}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-white">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL B: CATEGORY CREATE/EDIT ─── */}
      {catModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-base font-bold text-foreground">
                {catModal.editId ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setCatModal({ open: false, data: { name: '', description: '', warrantyPeriod: '', status: 'Active' } })}
                className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCatSubmit} className="space-y-4">
              <FormField id="cat-name" label="Category Name" required>
                <Input
                  id="cat-name"
                  value={catModal.data.name}
                  onChange={(e) => setCatModal((m) => ({ ...m, data: { ...m.data, name: e.target.value } }))}
                  placeholder="e.g. Electronics"
                />
              </FormField>

              <FormField id="cat-desc" label="Description">
                <textarea
                  id="cat-desc"
                  value={catModal.data.description}
                  onChange={(e) => setCatModal((m) => ({ ...m, data: { ...m.data, description: e.target.value } }))}
                  placeholder="Write a brief category description..."
                  className="w-full min-h-20 rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary hover:border-border/80 transition-all font-medium"
                />
              </FormField>

              <FormField id="cat-warranty" label="Warranty Period (Months)" required>
                <Input
                  id="cat-warranty"
                  type="number"
                  value={catModal.data.warrantyPeriod}
                  onChange={(e) => setCatModal((m) => ({ ...m, data: { ...m.data, warrantyPeriod: parseInt(e.target.value) || '' } }))}
                  placeholder="e.g. 12"
                />
              </FormField>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Status</label>
                <select
                  value={catModal.data.status}
                  onChange={(e) =>
                    setCatModal((m) => ({
                      ...m,
                      data: { ...m.data, status: e.target.value as 'Active' | 'Inactive' }
                    }))
                  }
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-border/80 transition-all font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-muted"
                  onClick={() => setCatModal({ open: false, data: { name: '', description: '', warrantyPeriod: '', status: 'Active' } })}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-white">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL C: EMPLOYEE PROMOTION ─── */}
      {promoModal.open && promoModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Role & Access Settings</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Adjust permissions for {promoModal.user.name}</p>
              </div>
              <button
                onClick={() => setPromoModal({ open: false, role: 'Employee', departmentId: null, status: 'Active' })}
                className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePromoSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Access Permission Role</label>
                <select
                  value={promoModal.role}
                  onChange={(e) => setPromoModal((m) => ({ ...m, role: e.target.value as UserRole }))}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-border/80 transition-all font-medium"
                >
                  <option value="Admin">Admin</option>
                  <option value="Asset Manager">Asset Manager</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Assigned Department</label>
                <select
                  value={promoModal.departmentId || ''}
                  onChange={(e) => setPromoModal((m) => ({ ...m, departmentId: e.target.value || null }))}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-border/80 transition-all font-medium"
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Active Status</label>
                <select
                  value={promoModal.status}
                  onChange={(e) => setPromoModal((m) => ({ ...m, status: e.target.value as 'Active' | 'Inactive' }))}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-border/80 transition-all font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-muted"
                  onClick={() => setPromoModal({ open: false, role: 'Employee', departmentId: null, status: 'Active' })}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
