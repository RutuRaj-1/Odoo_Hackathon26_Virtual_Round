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
  ShieldCheck
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { useToast } from '@/components/ui/toast'
import { firestoreService } from '@/services/firestoreService'
import type { Department, AssetCategoryDoc, User, UserRole } from '@/types'
import { getInitials } from '@/utils'

export function OrganizationPage() {
  const { toast } = useToast()
  
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

  // Load Firestore Data
  const loadData = async () => {
    setLoading(true)
    try {
      const [empList] = await Promise.all([
        firestoreService.getEmployees()
      ])
      setEmployees(empList)
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error loading data',
        description: error?.message || 'Something went wrong.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const unsubscribeDept = firestoreService.subscribeToDepartments((data) => {
      setDepartments(data)
    })
    const unsubscribeCat = firestoreService.subscribeToCategories((data) => {
      setCategories(data)
    })
    return () => {
      unsubscribeDept()
      unsubscribeCat()
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

    try {
      await firestoreService.updateEmployeeRoleAndDepartment(promoModal.user.uid || promoModal.user.id, {
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
      loadData()
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Organization Setup</h2>
        <p className="text-sm text-muted-foreground">
          Maintain departments, asset categories, and control access permissions.
        </p>
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3 bg-[#111115]">
          <TabsTrigger value="departments" className="gap-2">
            <Building className="h-4 w-4" /> Departments
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderOpen className="h-4 w-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2">
            <Users className="h-4 w-4" /> Employees
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB A: DEPARTMENTS ─── */}
        <TabsContent value="departments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white/90">Departments Directory</h3>
            <Button
              onClick={() =>
                setDeptModal({
                  open: true,
                  data: { name: '', departmentCode: '', parentDepartment: null, headId: null, status: 'Active' }
                })
              }
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Add Department
            </Button>
          </div>

          <div className="w-full max-w-sm">
            <label className="text-xs text-white/45 mb-1.5 block">Search department</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <Input
                placeholder="Search by name or code..."
                value={deptSearchTerm}
                onChange={(e) => setDeptSearchTerm(e.target.value)}
                className="pl-9 bg-[#111115]"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0c0c0f]">
            <table className="w-full border-collapse text-left text-sm text-white/70">
              <thead className="border-b border-white/8 bg-white/3 text-xs font-semibold uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Parent Department</th>
                  <th className="px-6 py-3.5">Department Head</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-white/30">
                      No departments matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => (
                    <tr key={dept.departmentId} className="hover:bg-white/1.5 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-white/90">{dept.departmentCode}</td>
                      <td className="px-6 py-4 font-medium text-white/90">{dept.name}</td>
                      <td className="px-6 py-4">{getDepartmentName(dept.parentDepartment)}</td>
                      <td className="px-6 py-4">{getUserName(dept.headId)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            dept.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-white/5 text-white/30'
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setDeptModal({ open: true, editId: dept.departmentId, data: { ...dept } })}
                            className="p-1 text-white/40 hover:text-white/80 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeptDelete(dept.departmentId)}
                            className="p-1 text-white/40 hover:text-red-400 transition-colors"
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
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white/90">Asset Categories</h3>
            <Button
              onClick={() =>
                setCatModal({
                  open: true,
                  data: { name: '', description: '', warrantyPeriod: '', status: 'Active' }
                })
              }
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0c0c0f]">
            <table className="w-full border-collapse text-left text-sm text-white/70">
              <thead className="border-b border-white/8 bg-white/3 text-xs font-semibold uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Warranty Period</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-white/30">
                      No asset categories registered yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.categoryId} className="hover:bg-white/1.5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white/90">{cat.name}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{cat.description || '-'}</td>
                      <td className="px-6 py-4">{cat.warrantyPeriod} Months</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            cat.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-white/5 text-white/30'
                          }`}
                        >
                          {cat.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setCatModal({ open: true, editId: cat.categoryId, data: { ...cat } })}
                            className="p-1 text-white/40 hover:text-white/80 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCatDelete(cat.categoryId)}
                            className="p-1 text-white/40 hover:text-red-400 transition-colors"
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
        <TabsContent value="employees" className="space-y-4">
          {/* Filters Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5 items-end">
            <div className="md:col-span-2">
              <label className="text-xs text-white/45 mb-1.5 block">Search employee</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 bg-[#111115]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/45 mb-1.5 block">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <label className="text-xs text-white/45 mb-1.5 block">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Asset Manager">Asset Manager</option>
                <option value="Department Head">Department Head</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-white/45 mb-1.5 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0c0c0f]">
            <table className="w-full border-collapse text-left text-sm text-white/70">
              <thead className="border-b border-white/8 bg-white/3 text-xs font-semibold uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Current Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-white/30">
                      No employees matching the criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-white/1.5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {emp.avatarUrl ? (
                            <img
                              src={emp.avatarUrl}
                              alt={emp.name}
                              className="h-9 w-9 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                              {getInitials(emp.name)}
                            </div>
                          )}
                          <span className="font-semibold text-white/90">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/50">{emp.email}</td>
                      <td className="px-6 py-4">{getDepartmentName(emp.departmentId)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80 border border-white/8">
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            emp.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-white/5 text-white/30'
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
                          className="flex items-center gap-1.5 ml-auto text-xs font-semibold text-indigo-400 hover:text-indigo-300 border border-indigo-500/15 hover:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 px-2.5 py-1.5 rounded-lg transition-colors"
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
            <div className="flex items-center justify-between border-t border-white/8 bg-white/2 px-6 py-4">
              <span className="text-xs text-white/35">
                Showing {filteredEmployees.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length}{' '}
                records
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── MODAL A: DEPARTMENT CREATE/EDIT ─── */}
      {deptModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0e0e12] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-4">
              <h3 className="text-base font-semibold">
                {deptModal.editId ? 'Edit Department' : 'Create Department'}
              </h3>
              <button
                onClick={() => setDeptModal({ open: false, data: { name: '', departmentCode: '', parentDepartment: null, headId: null, status: 'Active' } })}
                className="text-white/40 hover:text-white/80"
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
                <label className="text-xs text-white/50 mb-1.5 block">Parent Department</label>
                <select
                  value={deptModal.data.parentDepartment || ''}
                  onChange={(e) =>
                    setDeptModal((m) => ({
                      ...m,
                      data: { ...m.data, parentDepartment: e.target.value || null }
                    }))
                  }
                  className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None (Top-Level)</option>
                  {departments
                    .filter((d) => d.departmentId !== deptModal.editId) // Prevents circular nesting
                    .map((d) => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Department Head</label>
                <select
                  value={deptModal.data.headId || ''}
                  onChange={(e) =>
                    setDeptModal((m) => ({
                      ...m,
                      data: { ...m.data, headId: e.target.value || null }
                    }))
                  }
                  className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Status</label>
                <select
                  value={deptModal.data.status}
                  onChange={(e) =>
                    setDeptModal((m) => ({
                      ...m,
                      data: { ...m.data, status: e.target.value as 'Active' | 'Inactive' }
                    }))
                  }
                  className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeptModal({ open: false, data: { name: '', departmentCode: '', parentDepartment: null, headId: null, status: 'Active' } })}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL B: CATEGORY CREATE/EDIT ─── */}
      {catModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0e0e12] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-4">
              <h3 className="text-base font-semibold">
                {catModal.editId ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setCatModal({ open: false, data: { name: '', description: '', warrantyPeriod: '', status: 'Active' } })}
                className="text-white/40 hover:text-white/80"
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
                  className="w-full min-h-20 rounded-lg border border-white/8 bg-[#111115] px-3 py-2 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="text-xs text-white/50 mb-1.5 block">Status</label>
                <select
                  value={catModal.data.status}
                  onChange={(e) =>
                    setCatModal((m) => ({
                      ...m,
                      data: { ...m.data, status: e.target.value as 'Active' | 'Inactive' }
                    }))
                  }
                  className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCatModal({ open: false, data: { name: '', description: '', warrantyPeriod: '', status: 'Active' } })}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL C: EMPLOYEE PROMOTION ─── */}
      {promoModal.open && promoModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0e0e12] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-4">
              <div>
                <h3 className="text-base font-semibold">Role & Access Settings</h3>
                <p className="text-xs text-white/40 mt-0.5">{promoModal.user.name}</p>
              </div>
              <button
                onClick={() => setPromoModal({ open: false, role: 'Employee', departmentId: null, status: 'Active' })}
                className="text-white/40 hover:text-white/80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePromoSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Access Permission Role</label>
                <select
                  value={promoModal.role}
                  onChange={(e) => setPromoModal((m) => ({ ...m, role: e.target.value as UserRole }))}
                  className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Asset Manager">Asset Manager</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Assigned Department</label>
                <select
                  value={promoModal.departmentId || ''}
                  onChange={(e) => setPromoModal((m) => ({ ...m, departmentId: e.target.value || null }))}
                  className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="text-xs text-white/50 mb-1.5 block">Active Status</label>
                <select
                  value={promoModal.status}
                  onChange={(e) => setPromoModal((m) => ({ ...m, status: e.target.value as 'Active' | 'Inactive' }))}
                  className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPromoModal({ open: false, role: 'Employee', departmentId: null, status: 'Active' })}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
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
