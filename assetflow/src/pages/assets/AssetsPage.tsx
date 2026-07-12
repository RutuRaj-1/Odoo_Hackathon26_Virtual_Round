import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { assetService } from '@/services/assetService'
import { firestoreService } from '@/services/firestoreService'
import type { Asset, AssetStatus, Department } from '@/types'
import { ROUTES } from '@/constants'

export function AssetsPage() {
  const { toast } = useToast()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<Department[]>([])
  
  // Search & Filters State
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 8

  const loadAssets = async () => {
    setLoading(true)
    try {
      const res = await assetService.getAll({
        search: search.trim() || undefined,
        category: category || undefined,
        status: (status as AssetStatus) || undefined,
        page,
        pageSize
      })
      // Apply department filter client-side
      const filtered = departmentFilter
        ? res.data.filter(a => a.departmentId === departmentFilter)
        : res.data
      setAssets(filtered)
      setTotal(departmentFilter ? filtered.length : res.total)
      setTotalPages(departmentFilter ? Math.ceil(filtered.length / pageSize) : res.totalPages)
    } catch (err: any) {
      toast({
        variant: 'error',
        title: 'Error loading assets',
        description: err.message || 'Something went wrong.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    firestoreService.getDepartments().then(setDepartments).catch(() => {})
  }, [])

  useEffect(() => {
    loadAssets()
  }, [search, category, status, departmentFilter, page])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return
    try {
      await assetService.delete(id)
      toast({
        variant: 'success',
        title: 'Asset Deleted',
        description: 'The asset has been successfully deleted.'
      })
      loadAssets()
    } catch (err: any) {
      toast({
        variant: 'error',
        title: 'Delete Failed',
        description: err.message
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Assets Directory</h2>
          <p className="text-sm text-muted-foreground">
            Register and track your organization's physical and digital assets.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to={ROUTES.ASSET_CREATE}>
            <Plus className="h-4 w-4" /> New Asset
          </Link>
        </Button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 items-end">
        <div className="md:col-span-2">
          <label className="text-xs text-white/45 mb-1.5 block">Search asset</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Search by tag, name, or serial..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9 bg-[#111115]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-white/45 mb-1.5 block">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
            className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="furniture">Furniture</option>
            <option value="vehicle">Vehicle</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-white/45 mb-1.5 block">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
            <option value="Disposed">Disposed</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-white/45 mb-1.5 block">Department</label>
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value)
              setPage(1)
            }}
            className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0c0c0f]">
        <table className="w-full border-collapse text-left text-sm text-white/70">
          <thead className="border-b border-white/8 bg-white/3 text-xs font-semibold uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-6 py-3.5">Asset Tag</th>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Condition</th>
              <th className="px-6 py-3.5">Location</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-white/30">
                  <div className="flex justify-center items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    Loading assets...
                  </div>
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-white/30">
                  No assets found in the directory.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.assetId} className="hover:bg-white/1.5 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-white/90">{asset.assetTag}</td>
                  <td className="px-6 py-4 font-semibold text-white/90">{asset.assetName}</td>
                  <td className="px-6 py-4 capitalize">{asset.categoryId}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        asset.status === 'Available'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : asset.status === 'Allocated'
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : asset.status === 'Under Maintenance'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize">{asset.condition}</td>
                  <td className="px-6 py-4 text-white/50">{asset.location || 'HQ'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`${ROUTES.ASSETS}/${asset.assetId}`}
                        className="p-1 text-white/40 hover:text-white/80 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`${ROUTES.ASSETS}/${asset.assetId}/edit`}
                        className="p-1 text-white/40 hover:text-white/80 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(asset.assetId)}
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-white/8 bg-white/2 px-6 py-4">
          <span className="text-xs text-white/35">
            Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, total)} of {total} assets
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
