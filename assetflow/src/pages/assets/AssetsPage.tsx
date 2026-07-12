import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Eye, Edit, Trash2, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { firestoreService } from '@/services/firestoreService'
import type { Asset, Department, AssetCategoryDoc } from '@/types'
import { ROUTES } from '@/constants'
import { useToast } from '@/components/ui/toast'

export function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [categories, setCategories] = useState<AssetCategoryDoc[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const unsubAssets = firestoreService.subscribeToAssets(data => {
      setAssets(data)
      setLoading(false)
    })
    const unsubDepts = firestoreService.subscribeToDepartments(setDepartments)
    const unsubCats = firestoreService.subscribeToCategories(setCategories)

    return () => {
      unsubAssets()
      unsubDepts()
      unsubCats()
    }
  }, [])

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch =
        asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter ? asset.status === statusFilter : true
      const matchesCategory = categoryFilter ? asset.categoryId === categoryFilter : true
      const matchesDepartment = departmentFilter ? asset.departmentId === departmentFilter : true

      return matchesSearch && matchesStatus && matchesCategory && matchesDepartment
    })
  }, [assets, searchQuery, statusFilter, categoryFilter, departmentFilter])

  const handleDelete = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return
    try {
      await firestoreService.deleteAsset(assetId)
      toast({ variant: 'success', title: 'Asset Deleted', description: 'Asset was successfully removed.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const getDepartmentName = (id: string | null) => {
    if (!id) return 'Unassigned'
    return departments.find(d => d.departmentId === id)?.name || id
  }

  const getCategoryName = (id: string) => {
    return categories.find(c => c.categoryId === id)?.name || id
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'Allocated': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Reserved': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'Under Maintenance': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'Retired':
      case 'Disposed':
      case 'Lost':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      default: return 'bg-white/10 text-white/70 border-white/20'
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading assets...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Assets</h2>
          <p className="text-sm text-white/60">Manage hardware, software, and physical equipment.</p>
        </div>
        <Button onClick={() => navigate(ROUTES.ASSET_CREATE)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4" />
          Register Asset
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0c0c0f] overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tag, name, serial..."
              className="pl-9 w-full bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 min-w-[120px]"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.name}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 min-w-[130px]"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Reserved">Reserved</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
              <option value="Disposed">Disposed</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-white/70">
            <thead className="border-b border-white/8 bg-white/3 text-xs font-semibold uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-white/20" />
                      <span>No assets found matching your criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => (
                  <tr key={asset.assetId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white/90">{asset.assetName}</span>
                        <span className="text-xs text-white/40">{asset.assetTag} • {asset.serialNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getCategoryName(asset.categoryId)}</td>
                    <td className="px-6 py-4">{getDepartmentName(asset.departmentId)}</td>
                    <td className="px-6 py-4">{asset.location}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/assets/${asset.assetId}`} className="p-1.5 text-white/40 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-md transition-colors">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link to={`/assets/${asset.assetId}/edit`} className="p-1.5 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(asset.assetId)} className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors">
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
      </div>
    </motion.div>
  )
}
