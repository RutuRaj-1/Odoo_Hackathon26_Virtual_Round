import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, Save } from 'lucide-react'
import { ROUTES } from '@/constants'
import { firestoreService } from '@/services/firestoreService'
import { bookingService } from '@/services/bookingService'
import type { Asset } from '@/types'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { useAuth } from '@/hooks/useAuth'

export function BookingFormPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])

  const [assetId, setAssetId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [purpose, setPurpose] = useState('')

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const allAssets = await firestoreService.getAssets()
        // Only allow booking available or allocated assets (not retired/disposed/maintenance)
        setAssets(allAssets.filter(a => a.status === 'Available' || a.status === 'Allocated'))
      } catch (error: any) {
        toast({ variant: 'error', title: 'Fetch Error', description: error.message })
      } finally {
        setLoading(false)
      }
    }
    fetchAssets()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetId || !startDate || !endDate || !purpose.trim() || !currentUser) {
      toast({ variant: 'error', title: 'Validation Error', description: 'Please complete all required fields.' })
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({ variant: 'error', title: 'Invalid Dates', description: 'End date must be after start date.' })
      return
    }

    setSubmitting(true)
    try {
      await bookingService.create({
        assetId,
        startDate,
        endDate,
        purpose: purpose.trim(),
        requestedBy: currentUser.name || currentUser.email,
        status: 'pending',
        priority: 'medium'
      })
      toast({ variant: 'success', title: 'Booking Requested', description: 'Your request has been submitted for approval.' })
      navigate(ROUTES.BOOKINGS)
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading resources list...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <Link to={ROUTES.BOOKINGS} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Bookings
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CalendarCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">New Booking Request</h2>
          <p className="text-sm text-muted-foreground">Reserve a resource, conference room, vehicle, or equipment.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/8 bg-[#0c0c0f] p-6 text-white">
        <div>
          <label className="text-xs text-white/50 mb-1.5 block">Select Resource *</label>
          <select
            required
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="w-full h-10 rounded-lg border border-white/8 bg-[#111115] px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Choose an Asset...</option>
            {assets.map((asset) => (
              <option key={asset.assetId} value={asset.assetId}>
                {asset.assetTag} - {asset.assetName} ({asset.location || 'HQ'})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="start-date" label="Start Date & Time" required>
            <Input
              id="start-date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormField>

          <FormField id="end-date" label="End Date & Time" required>
            <Input
              id="end-date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormField>
        </div>

        <FormField id="purpose" label="Purpose of Reservation" required>
          <textarea
            id="purpose"
            required
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Describe the usage (e.g. Client presentation, Project deployment)..."
            className="w-full min-h-20 rounded-lg border border-white/8 bg-[#111115] px-3 py-2 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(ROUTES.BOOKINGS)}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
            <Save className="h-4 w-4" />
            {submitting ? 'Submitting...' : 'Request Booking'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
