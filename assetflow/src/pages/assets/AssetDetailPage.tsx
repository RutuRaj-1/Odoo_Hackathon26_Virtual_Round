import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Edit, Trash2, Calendar, MapPin, Hash, CheckCircle, Tag, DollarSign, User as UserIcon } from 'lucide-react'
import { ROUTES } from '@/constants'
import { firestoreService } from '@/services/firestoreService'
import type { Asset, Department, AssetCategoryDoc, User } from '@/types'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [asset, setAsset] = useState<Asset | null>(null)
  const [department, setDepartment] = useState<Department | null>(null)
  const [category, setCategory] = useState<AssetCategoryDoc | null>(null)
  const [assignedUser, setAssignedUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (!id) return
        const [assets, depts, cats, users] = await Promise.all([
          firestoreService.getAssets(),
          firestoreService.getDepartments(),
          firestoreService.getCategories(),
          firestoreService.getEmployees()
        ])
        
        const foundAsset = assets.find(a => a.assetId === id)
        if (!foundAsset) {
          toast({ variant: 'error', title: 'Not Found', description: 'Asset not found.' })
          navigate(ROUTES.ASSETS)
          return
        }
        
        setAsset(foundAsset)
        if (foundAsset.departmentId) setDepartment(depts.find(d => d.departmentId === foundAsset.departmentId) || null)
        if (foundAsset.categoryId) setCategory(cats.find(c => c.categoryId === foundAsset.categoryId) || null)
        if (foundAsset.assignedTo) setAssignedUser(users.find(u => u.uid === foundAsset.assignedTo) || null)
      } catch (error: any) {
        toast({ variant: 'error', title: 'Error', description: error.message })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, navigate, toast])

  const handleDelete = async () => {
    if (!asset || !confirm('Are you sure you want to delete this asset?')) return
    try {
      await firestoreService.deleteAsset(asset.assetId)
      toast({ variant: 'success', title: 'Deleted', description: 'Asset deleted successfully.' })
      navigate(ROUTES.ASSETS)
    } catch (error: any) {
      toast({ variant: 'error', title: 'Delete Failed', description: error.message })
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading asset details...</div>
  }

  if (!asset) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0c0c0f] p-6 rounded-xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10">
            <Package className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{asset.assetName}</h2>
            <p className="text-sm text-white/60 font-mono mt-1">{asset.assetTag} • {asset.serialNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button onClick={() => navigate(`/assets/${asset.assetId}/edit`)} variant="outline" className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10 w-full md:w-auto">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button onClick={handleDelete} variant="outline" className="gap-2 border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 w-full md:w-auto">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#0c0c0f] rounded-xl border border-white/10 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Asset Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Tag className="h-4 w-4" />
                  <span>Category</span>
                </div>
                <p className="font-medium text-white/90">{category?.name || asset.categoryId}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <CheckCircle className="h-4 w-4" />
                  <span>Status</span>
                </div>
                <p className="font-medium text-white/90">{asset.status}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </div>
                <p className="font-medium text-white/90">{asset.location || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Hash className="h-4 w-4" />
                  <span>Condition</span>
                </div>
                <p className="font-medium text-white/90 capitalize">{asset.condition}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0c0c0f] rounded-xl border border-white/10 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Financial Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Calendar className="h-4 w-4" />
                  <span>Purchase Date</span>
                </div>
                <p className="font-medium text-white/90">{asset.purchaseDate || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <DollarSign className="h-4 w-4" />
                  <span>Acquisition Cost</span>
                </div>
                <p className="font-medium text-white/90">
                  {asset.purchaseCost ? `$${asset.purchaseCost.toFixed(2)}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0c0c0f] rounded-xl border border-white/10 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Assignment</h3>
            
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <UserIcon className="h-4 w-4" />
                  <span>Assigned To</span>
                </div>
                {assignedUser ? (
                  <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="font-medium text-white/90">{assignedUser.name}</p>
                    <p className="text-sm text-white/40">{assignedUser.email}</p>
                  </div>
                ) : (
                  <p className="font-medium text-white/90">In Inventory (Unassigned)</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Package className="h-4 w-4" />
                  <span>Department</span>
                </div>
                <p className="font-medium text-white/90">{department?.name || 'Unassigned'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
