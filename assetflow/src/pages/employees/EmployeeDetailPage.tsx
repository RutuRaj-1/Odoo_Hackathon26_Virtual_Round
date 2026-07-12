import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Mail, Building, Shield, Package } from 'lucide-react'
import { ROUTES } from '@/constants'
import { firestoreService } from '@/services/firestoreService'
import { assetService } from '@/services/assetService'
import type { User, Department, Asset } from '@/types'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [employee, setEmployee] = useState<User | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [assignedAssets, setAssignedAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchEmployeeData = async () => {
      setLoading(true)
      try {
        const [allEmps, allDepts, assetsResponse] = await Promise.all([
          firestoreService.getEmployees(),
          firestoreService.getDepartments(),
          assetService.getAll({ page: 1, pageSize: 500 })
        ])

        const foundEmp = allEmps.find((e) => e.uid === id)
        if (!foundEmp) {
          throw new Error('Employee not found.')
        }

        setEmployee(foundEmp)
        setDepartments(allDepts)
        // Filter assets currently assigned to this user
        setAssignedAssets(assetsResponse.data.filter((asset) => asset.assignedTo === id))
      } catch (error: any) {
        toast({ variant: 'error', title: 'Load Error', description: error.message })
        navigate(ROUTES.EMPLOYEES)
      } finally {
        setLoading(false)
      }
    }
    fetchEmployeeData()
  }, [id, toast])

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading profile data...</div>
  }

  if (!employee) return null

  const getDeptName = (deptId: string | null) => {
    if (!deptId) return 'Unassigned'
    return departments.find((d) => d.departmentId === deptId)?.name || 'Unassigned'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl"
    >
      <div className="flex items-center justify-between">
        <Link to={ROUTES.EMPLOYEES} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Employees
        </Link>
        <Button variant="outline" size="sm" asChild className="text-white border-white/10">
          <Link to={`/admin/organization`}>Adjust Role Settings</Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Employee Profile</h2>
          <p className="text-sm text-muted-foreground">Departmental Assignment & Allocated Assets</p>
        </div>
      </div>

      {/* Main Employee Metadata card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-white/8 bg-[#0c0c0f] p-6 text-white text-sm">
        <div className="space-y-4">
          <div>
            <span className="text-white/40 block text-xs">Name</span>
            <span className="font-semibold text-white/95 text-base">{employee.name}</span>
          </div>

          <div>
            <span className="text-white/40 block text-xs">Email Address</span>
            <span className="flex items-center gap-2 font-semibold text-white/95 mt-1">
              <Mail className="h-4 w-4 text-primary" />
              {employee.email}
            </span>
          </div>

          <div>
            <span className="text-white/40 block text-xs">Department</span>
            <span className="flex items-center gap-2 font-semibold text-white/95 mt-1">
              <Building className="h-4 w-4 text-primary" />
              {getDeptName(employee.departmentId)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-white/40 block text-xs">System Access Role</span>
            <span className="flex items-center gap-2 font-semibold text-white/95 mt-1">
              <Shield className="h-4 w-4 text-primary" />
              {employee.role}
            </span>
          </div>

          <div>
            <span className="text-white/40 block text-xs">Status</span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1 border ${
                employee.status === 'Active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {employee.status || 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Allocated Assets Listing */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> Allocated Assets ({assignedAssets.length})
        </h3>
        
        <div className="rounded-xl border border-white/8 bg-[#0c0c0f] overflow-hidden">
          <table className="w-full border-collapse text-left text-sm text-white/70">
            <thead className="border-b border-white/8 bg-white/3 text-xs font-semibold uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-6 py-3.5">Asset Tag</th>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Condition</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {assignedAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/30">
                    No resources currently allocated to this user.
                  </td>
                </tr>
              ) : (
                assignedAssets.map((asset) => (
                  <tr key={asset.assetId} className="hover:bg-white/1.5 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-white/90">{asset.assetTag}</td>
                    <td className="px-6 py-4 font-semibold text-white/90">{asset.assetName}</td>
                    <td className="px-6 py-4 capitalize">{asset.categoryId}</td>
                    <td className="px-6 py-4 text-white/50">{asset.location || 'HQ'}</td>
                    <td className="px-6 py-4 capitalize">{asset.condition}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="link" size="sm" asChild className="text-primary hover:text-indigo-300">
                        <Link to={`${ROUTES.ASSETS}/${asset.assetId}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
