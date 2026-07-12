import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { useToast } from '@/components/ui/toast'
import { assetService } from '@/services/assetService'
import type { AssetStatus, AssetCondition } from '@/types'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'

export function AssetFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form Fields State
  const [assetName, setAssetName] = useState('')
  const [categoryId, setCategoryId] = useState('hardware')
  const [status, setStatus] = useState<AssetStatus>('Available')
  const [condition, setCondition] = useState<AssetCondition>('excellent')
  const [serialNumber, setSerialNumber] = useState('')
  const [purchaseCost, setPurchaseCost] = useState<string>('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!id) return
    const fetchAsset = async () => {
      setLoading(true)
      try {
        const asset = await assetService.getById(id)
        setAssetName(asset.assetName)
        setCategoryId(asset.categoryId)
        setStatus(asset.status)
        setCondition(asset.condition)
        setSerialNumber(asset.serialNumber || '')
        setPurchaseCost(asset.purchaseCost ? asset.purchaseCost.toString() : '')
        setLocation(asset.location || '')
        setDescription(asset.description || '')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetName.trim()) {
      toast({ variant: 'error', title: 'Validation Error', description: 'Asset Name is required.' })
      return
    }

    setSubmitting(true)

    try {
      if (isEdit && id) {
        await assetService.update(id, {
          assetName: assetName.trim(),
          categoryId,
          status,
          condition,
          serialNumber: serialNumber.trim(),
          purchaseCost: purchaseCost ? parseFloat(purchaseCost) : 0,
          location: location.trim(),
          description: description.trim()
        })
        toast({ variant: 'success', title: 'Asset Updated', description: 'The asset details have been saved.' })
      } else {
        await assetService.create({
          assetName: assetName.trim(),
          categoryId,
          status,
          condition,
          serialNumber: serialNumber.trim(),
          purchaseCost: purchaseCost ? parseFloat(purchaseCost) : 0,
          location: location.trim(),
          description: description.trim(),
          departmentId: null,
          purchaseDate: new Date().toISOString(),
          assignedTo: null,
          createdBy: currentUser?.name || 'Admin'
        })
        toast({ variant: 'success', title: 'Asset Registered', description: 'The new asset has been added to the directory.' })
      }
      navigate(ROUTES.ASSETS)
    } catch (err: any) {
      toast({ variant: 'error', title: 'Operation Failed', description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link to={ROUTES.ASSETS} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Assets
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{isEdit ? 'Edit Asset' : 'Register New Asset'}</h2>
          <p className="text-sm text-muted-foreground">
            {isEdit ? `Update details for asset ID: ${id}` : 'Fill in the details to register a new tracking asset.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/8 bg-[#0c0c0f] p-6 text-white">
        <FormField id="asset-name" label="Asset Name" required>
          <Input
            id="asset-name"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="e.g. MacBook Pro M3"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="furniture">Furniture</option>
              <option value="vehicle">Vehicle</option>
              <option value="equipment">Equipment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Condition *</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as AssetCondition)}
              className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="serial-number" label="Serial Number">
            <Input
              id="serial-number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. C02XG1..."
            />
          </FormField>

          <FormField id="purchase-price" label="Purchase Cost ($)">
            <Input
              id="purchase-price"
              type="number"
              step="0.01"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              placeholder="e.g. 1999.99"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="location" label="Location">
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. London Office, Floor 3"
            />
          </FormField>

          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AssetStatus)}
              className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Reserved">Reserved</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Lost">Lost</option>
              <option value="Retired">Retired</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>
        </div>

        <FormField id="description" label="Description">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Log technical specifications or notes here..."
            className="w-full min-h-20 rounded-lg border border-white/8 bg-[#111115] px-3 py-2 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(ROUTES.ASSETS)}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Asset'}
          </Button>
        </div>
      </form>
    </div>
  )
}
