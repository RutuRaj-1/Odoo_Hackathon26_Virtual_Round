import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Save } from 'lucide-react'
import { ROUTES } from '@/constants'
import { firestoreService } from '@/services/firestoreService'
import type { Asset, Department, AssetCategoryDoc, User } from '@/types'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

export function AssetFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<Department[]>([])
  const [categories, setCategories] = useState<AssetCategoryDoc[]>([])
  const [users, setUsers] = useState<User[]>([])

  const [formData, setFormData] = useState<Partial<Asset>>({
    assetTag: '',
    assetName: '',
    serialNumber: '',
    categoryId: '',
    departmentId: '',
    status: 'Available',
    location: '',
    condition: 'good',
    purchaseDate: '',
    purchaseCost: 0,
    assignedTo: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [depts, cats, emps] = await Promise.all([
          firestoreService.getDepartments(),
          firestoreService.getCategories(),
          firestoreService.getEmployees()
        ])
        setDepartments(depts)
        setCategories(cats)
        setUsers(emps)

        if (isEdit && id) {
          const assets = await firestoreService.getAssets()
          const asset = assets.find(a => a.assetId === id)
          if (asset) {
            setFormData(asset)
          } else {
            toast({ variant: 'error', title: 'Not Found', description: 'Asset not found.' })
            navigate(ROUTES.ASSETS)
          }
        } else {
          const nextTag = await firestoreService.generateNextAssetTag()
          setFormData(prev => ({ ...prev, assetTag: nextTag }))
        }
      } catch (error: any) {
        toast({ variant: 'error', title: 'Error loading data', description: error.message })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, isEdit, navigate, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.assetName || !formData.categoryId || !formData.status) {
      toast({ variant: 'error', title: 'Validation Error', description: 'Please fill all required fields.' })
      return
    }

    try {
      if (isEdit && id) {
        await firestoreService.updateAsset(id, formData as Partial<Omit<Asset, 'assetId' | 'createdAt'>>)
        toast({ variant: 'success', title: 'Success', description: 'Asset updated successfully.' })
      } else {
        const dataToSave = {
          ...formData,
          createdBy: currentUser?.uid || 'system',
          departmentId: formData.departmentId || null,
          assignedTo: formData.assignedTo || null,
        } as Omit<Asset, 'assetId' | 'createdAt'>
        await firestoreService.createAsset(dataToSave)
        toast({ variant: 'success', title: 'Success', description: 'Asset registered successfully.' })
      }
      navigate(ROUTES.ASSETS)
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading asset data...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.ASSETS}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assets
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
          <Package className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {isEdit ? 'Edit Asset' : 'Register New Asset'}
          </h2>
          <p className="text-sm text-white/60">
            {isEdit ? `Modifying details for ${formData.assetTag}` : 'Fill in the details to catalog a new asset.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#0c0c0f] rounded-xl border border-white/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Asset Tag (Read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Asset Tag</label>
            <Input
              disabled
              value={formData.assetTag || ''}
              className="bg-white/5 border-white/10 text-white/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Asset Name *</label>
            <Input
              required
              value={formData.assetName || ''}
              onChange={e => setFormData({ ...formData, assetName: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
              placeholder="e.g. MacBook Pro M3"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Serial Number</label>
            <Input
              value={formData.serialNumber || ''}
              onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
              placeholder="Enter serial number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Category *</label>
            <select
              required
              value={formData.categoryId || ''}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Department</label>
            <select
              value={formData.departmentId || ''}
              onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Unassigned</option>
              {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Assigned To</label>
            <select
              value={formData.assignedTo || ''}
              onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">None (In Inventory)</option>
              {users.map(u => <option key={u.uid} value={u.uid}>{u.name} ({u.email})</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Status *</label>
            <select
              required
              value={formData.status || 'Available'}
              onChange={e => setFormData({ ...formData, status: e.target.value as Asset['status'] })}
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Reserved">Reserved</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
              <option value="Disposed">Disposed</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Condition</label>
            <select
              value={formData.condition || 'good'}
              onChange={e => setFormData({ ...formData, condition: e.target.value as Asset['condition'] })}
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Location</label>
            <Input
              value={formData.location || ''}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
              placeholder="e.g. Storage Room A"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Purchase Date</label>
            <Input
              type="date"
              value={formData.purchaseDate || ''}
              onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Purchase / Acquisition Cost</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.purchaseCost || ''}
                onChange={e => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })}
                className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.ASSETS)} className="text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button type="submit" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Save className="h-4 w-4" />
            {isEdit ? 'Save Changes' : 'Register Asset'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
