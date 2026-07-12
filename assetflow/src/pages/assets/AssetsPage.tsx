import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Edit, Trash2, Package, Inbox } from 'lucide-react'
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

  // Resolves the category ID to a clear name, using fallback general category name instead of raw Firestore IDs
  const getCategoryName = (id: string) => {
    if (!categories || categories.length === 0) return 'Loading...'
    const cat = categories.find(c => c.categoryId === id)
    return cat ? cat.name : 'General Equipment'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': 
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
      case 'Allocated': 
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
      case 'Reserved': 
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
      case 'Under Maintenance': 
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
      case 'Retired':
      case 'Disposed':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
      case 'Lost':
      case 'Missing':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
      default: 
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Assets</h2>
          <p className="text-sm text-muted-foreground">Manage your hardware inventory, department allocations, and lifecycle status.</p>
        </div>
        <Button onClick={() => navigate(ROUTES.ASSET_CREATE)} className="gap-2 bg-primary hover:opacity-95 text-white">
          <Plus className="h-4 w-4" />
          Register Asset
        </Button>
      </div>

      {/* Main Table Shell */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-border flex flex-col xl:flex-row gap-4 items-center justify-between bg-card">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets by tag, name, serial..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary hover:border-border/80 transition-all font-medium"
            />
          </div>
          
          <div className="flex flex-wrap gap-2.5 w-full xl:w-auto">
            {/* Category selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium hover:border-border/85 transition-all min-w-[140px] flex-1 sm:flex-none cursor-pointer"
            >
              <option value="" className="text-muted-foreground">All Categories</option>
              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
            </select>

            {/* Department selector */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium hover:border-border/85 transition-all min-w-[150px] flex-1 sm:flex-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.name}</option>)}
            </select>

            {/* Status selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium hover:border-border/85 transition-all min-w-[140px] flex-1 sm:flex-none cursor-pointer"
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

        {/* Table layout */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
              <LoaderIcon className="h-6 w-6 animate-spin text-primary" />
              <span>Fetching asset catalog...</span>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Inbox className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground text-base">No Assets Found</h3>
                <p className="text-xs">Adjust your search parameters or filter options to locate assets.</p>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-foreground/80">
              <thead className="border-b border-border bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Asset Info</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Category</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Department</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Location</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filteredAssets.map(asset => (
                  <tr key={asset.assetId} className="hover:bg-muted/10 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">{asset.assetName}</span>
                        <span className="text-xs text-muted-foreground font-mono mt-0.5">{asset.assetTag} • SN: {asset.serialNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/90 font-semibold">{getCategoryName(asset.categoryId)}</td>
                    <td className="px-6 py-4 text-foreground/75">{getDepartmentName(asset.departmentId)}</td>
                    <td className="px-6 py-4 text-foreground/75">{asset.location || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border capitalize ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/assets/${asset.assetId}`}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/assets/${asset.assetId}/edit`}
                          className="p-2 text-muted-foreground hover:text-indigo-400 hover:bg-indigo-400/5 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(asset.assetId)}
                          className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
