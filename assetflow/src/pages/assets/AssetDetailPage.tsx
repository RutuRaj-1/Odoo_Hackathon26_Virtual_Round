import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { assetService } from '@/services/assetService'
import type { Asset } from '@/types'
import { ROUTES } from '@/constants'

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchAsset = async () => {
      setLoading(true)
      try {
        const data = await assetService.getById(id)
        setAsset(data)
      } catch (err: any) {
        toast({
          variant: 'error',
          title: 'Error loading asset',
          description: err.message
        })
        navigate(ROUTES.ASSETS)
      } finally {
        setLoading(false)
      }
    }
    fetchAsset()
  }, [id])

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this asset?')) return
    try {
      await assetService.delete(id)
      toast({
        variant: 'success',
        title: 'Asset Deleted',
        description: 'Successfully deleted the asset.'
      })
      navigate(ROUTES.ASSETS)
    } catch (err: any) {
      toast({
        variant: 'error',
        title: 'Delete Failed',
        description: err.message
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (!asset) return null

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link to={ROUTES.ASSETS} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Assets
        </Link>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link to={`${ROUTES.ASSETS}/${asset.assetId}/edit`}>
              <Edit2 className="h-3.5 w-3.5" /> Edit Asset
            </Link>
          </Button>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete Asset
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{asset.assetName}</h2>
          <p className="text-sm text-muted-foreground">Asset Tag: {asset.assetTag}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-white/8 bg-[#0c0c0f] p-6 text-white text-sm">
        <div className="space-y-3">
          <div>
            <span className="text-white/40 block text-xs">Category</span>
            <span className="font-semibold text-white/95 capitalize">{asset.categoryId}</span>
          </div>
          <div>
            <span className="text-white/40 block text-xs">Condition</span>
            <span className="font-semibold text-white/95 capitalize">{asset.condition}</span>
          </div>
          <div>
            <span className="text-white/40 block text-xs">Status</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${
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
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-white/40 block text-xs">Serial Number</span>
            <span className="font-semibold text-white/95 font-mono">{asset.serialNumber || 'N/A'}</span>
          </div>
          <div>
            <span className="text-white/40 block text-xs">Location</span>
            <span className="font-semibold text-white/95">{asset.location || 'HQ'}</span>
          </div>
          <div>
            <span className="text-white/40 block text-xs">Acquisition Cost</span>
            <span className="font-semibold text-white/95">
              {asset.purchaseCost ? `$${asset.purchaseCost.toLocaleString()}` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
