import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Save } from 'lucide-react'
import { ROUTES } from '@/constants'
import { firestoreService } from '@/services/firestoreService'
import type { User, Department, UserRole } from '@/types'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'

export function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [employee, setEmployee] = useState<User | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])

  const [role, setRole] = useState<UserRole>('Employee')
  const [departmentId, setDepartmentId] = useState<string>('')
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')

  useEffect(() => {
    if (!id) return
    const loadEmployeeData = async () => {
      try {
        const [allEmps, allDepts] = await Promise.all([
          firestoreService.getEmployees(),
          firestoreService.getDepartments()
        ])
        const found = allEmps.find((e) => e.uid === id)
        if (!found) {
          throw new Error('Employee profile not found.')
        }
        setEmployee(found)
        setDepartments(allDepts)
        setRole(found.role)
        setDepartmentId(found.departmentId || '')
        setStatus(found.status || 'Active')
      } catch (error: any) {
        toast({ variant: 'error', title: 'Load Error', description: error.message })
        navigate(ROUTES.EMPLOYEES)
      } finally {
        setLoading(false)
      }
    }
    loadEmployeeData()
  }, [id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSubmitting(true)

    try {
      await firestoreService.updateEmployeeRoleAndDepartment(id, {
        role,
        departmentId: departmentId || null,
        status
      })
      toast({ variant: 'success', title: 'Profile Updated', description: 'Employee permissions and department updated successfully.' })
      navigate(ROUTES.EMPLOYEES)
    } catch (error: any) {
      toast({ variant: 'error', title: 'Save Failed', description: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading form...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <Link to={ROUTES.EMPLOYEES} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Employees
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Edit Employee Access</h2>
          <p className="text-sm text-muted-foreground">Adjust organizational settings for {employee?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/8 bg-[#0c0c0f] p-6 text-white">
        <div>
          <label className="text-xs text-white/50 mb-1.5 block">Access Permission Role *</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
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
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
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
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
            className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(ROUTES.EMPLOYEES)}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
            <Save className="h-4 w-4" />
            {submitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
