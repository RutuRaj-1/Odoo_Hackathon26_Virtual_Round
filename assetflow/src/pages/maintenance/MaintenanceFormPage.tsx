import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wrench, Save } from 'lucide-react'
import { ROUTES } from '@/constants'
import { firestoreService } from '@/services/firestoreService'
import { maintenanceService } from '@/services/maintenanceService'
import type { Asset, MaintenanceRecord } from '@/types'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

export function MaintenanceFormPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [assets, setAssets] = useState<Asset[]>([])

  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({
    assetId: '',
    type: 'corrective',
    priority: 'medium',
    title: '',
    description: ''
  })

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const allAssets = await firestoreService.getAssets()
        setAssets(allAssets)
      } catch (error: any) {
        toast({ variant: 'error', title: 'Error', description: error.message })
      } finally {
        setLoading(false)
      }
    }
    fetchAssets()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.assetId || !formData.title || !currentUser) {
      toast({ variant: 'error', title: 'Validation Error', description: 'Please fill all required fields.' })
      return
    }

    try {
      await maintenanceService.raiseRequest({
        assetId: formData.assetId,
        type: formData.type as any,
        priority: formData.priority as any,
        title: formData.title,
        description: formData.description || ''
      }, currentUser.uid)
      
      toast({ variant: 'success', title: 'Success', description: 'Maintenance request submitted.' })
      navigate(ROUTES.MAINTENANCE)
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading form data...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.MAINTENANCE}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Maintenance
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
          <Wrench className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Raise Maintenance Request</h2>
          <p className="text-sm text-white/60">Submit an asset for repairs or routine inspection.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#0c0c0f] rounded-xl border border-white/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white/80">Asset *</label>
            <select
              required
              value={formData.assetId || ''}
              onChange={e => setFormData({ ...formData, assetId: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Asset</option>
              {assets.map(a => (
                <option key={a.assetId} value={a.assetId}>
                  {a.assetTag} - {a.assetName} (Status: {a.status})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white/80">Issue Title *</label>
            <Input
              required
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
              placeholder="Brief title of the issue"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white/80">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
              placeholder="Provide detailed information about the maintenance required..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Maintenance Type</label>
            <select
              value={formData.type || 'corrective'}
              onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="corrective">Corrective (Repair)</option>
              <option value="preventive">Preventive</option>
              <option value="predictive">Predictive</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Priority</label>
            <select
              value={formData.priority || 'medium'}
              onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.MAINTENANCE)} className="text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button type="submit" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Save className="h-4 w-4" />
            Submit Request
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
