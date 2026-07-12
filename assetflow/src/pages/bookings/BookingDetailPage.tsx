import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, Check, X, Ban } from 'lucide-react'
import { ROUTES } from '@/constants'
import { bookingService } from '@/services/bookingService'
import { assetService } from '@/services/assetService'
import type { Booking, Asset } from '@/types'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils'
import { useAuth } from '@/hooks/useAuth'

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await bookingService.getById(id)
      setBooking(data)
      const assetData = await assetService.getById(data.assetId)
      setAsset(assetData)
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error loading details', description: error.message })
      navigate(ROUTES.BOOKINGS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleApprove = async () => {
    if (!id) return
    try {
      await bookingService.approve(id)
      toast({ variant: 'success', title: 'Booking Approved', description: 'Resource reserved successfully.' })
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleReject = async () => {
    if (!id) return
    const reason = prompt('Please enter a rejection reason:')
    if (reason === null) return
    try {
      await bookingService.reject(id, reason || 'Request declined by administration.')
      toast({ variant: 'warning', title: 'Booking Rejected', description: 'Request status updated.' })
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleCancel = async () => {
    if (!id || !confirm('Are you sure you want to cancel this booking?')) return
    try {
      await bookingService.cancel(id)
      toast({ variant: 'warning', title: 'Booking Cancelled', description: 'Reservation has been cancelled.' })
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading details...</div>
  }

  if (!booking) return null

  const canManage = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager' || currentUser?.role === 'Department Head'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-3xl"
    >
      <div className="flex items-center justify-between">
        <Link to={ROUTES.BOOKINGS} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Bookings
        </Link>

        <div className="flex gap-2">
          {booking.status === 'pending' && canManage && (
            <>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={handleApprove}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button size="sm" variant="destructive" className="gap-1.5" onClick={handleReject}>
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
            </>
          )}
          {(booking.status === 'pending' || booking.status === 'approved') && (
            <Button size="sm" variant="outline" className="gap-1.5 text-white/70 border-white/10" onClick={handleCancel}>
              <Ban className="h-3.5 w-3.5" /> Cancel Reservation
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CalendarCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{booking.bookingNumber}</h2>
          <p className="text-sm text-muted-foreground">Resource Reservation Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-white/8 bg-[#0c0c0f] p-6 text-white text-sm">
        <div className="space-y-4">
          <div>
            <span className="text-white/40 block text-xs">Resource Booked</span>
            <span className="font-semibold text-white/95">{asset?.assetName || 'Unknown Asset'}</span>
            <span className="text-xs text-white/50 block mt-0.5">Tag: {asset?.assetTag || '-'}</span>
          </div>

          <div>
            <span className="text-white/40 block text-xs">Reservation Window</span>
            <span className="font-semibold text-white/95">
              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
            </span>
          </div>

          <div>
            <span className="text-white/40 block text-xs">Purpose</span>
            <p className="text-white/80 leading-relaxed mt-1">{booking.purpose}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-white/40 block text-xs">Requested By</span>
            <span className="font-semibold text-white/95">{booking.requestedBy}</span>
          </div>

          <div>
            <span className="text-white/40 block text-xs">Current Status</span>
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold mt-1 border capitalize ${
                booking.status === 'pending'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : booking.status === 'approved'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : booking.status === 'rejected'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-white/5 text-white/30 border-white/10'
              }`}
            >
              {booking.status}
            </span>
          </div>

          {booking.rejectionReason && (
            <div>
              <span className="text-rose-400 block text-xs">Rejection Reason</span>
              <p className="text-rose-200 mt-1 leading-relaxed">{booking.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
