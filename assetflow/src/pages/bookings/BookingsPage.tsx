import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  CalendarCheck,
  Search,
  Plus,
  Clock,
  User,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { bookingService } from '@/services/bookingService'
import { firestoreService } from '@/services/firestoreService'
import type { Booking, Asset } from '@/types'
import { ROUTES } from '@/constants'
import { formatDate } from '@/utils'

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const { toast } = useToast()
  const navigate = useNavigate()

  const loadData = async () => {
    try {
      const [bookingsResponse, assetsData] = await Promise.all([
        bookingService.getAll({ page: 1, pageSize: 500 }),
        firestoreService.getAssets()
      ])
      setBookings(bookingsResponse.data)
      setAssets(assetsData)
    } catch (error: any) {
      toast({ variant: 'error', title: 'Fetch Error', description: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Approve booking request handler
  const handleApprove = async (id: string) => {
    try {
      await bookingService.approve(id)
      toast({ variant: 'success', title: 'Booking Approved', description: 'Resource slot has been reserved.' })
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  // Reject booking request handler
  const handleReject = async (id: string) => {
    const reason = prompt('Please enter the reason for rejection:')
    if (reason === null) return
    try {
      await bookingService.reject(id, reason || 'Rejected by administrator')
      toast({ variant: 'warning', title: 'Booking Rejected', description: 'Reservation request declined.' })
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  // Filter logic
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const asset = assets.find(a => a.assetId === b.assetId)
      const assetName = asset ? asset.assetName.toLowerCase() : ''
      const matchesSearch =
        b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assetName.includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter ? b.status === statusFilter : true

      return matchesSearch && matchesStatus
    })
  }, [bookings, assets, searchTerm, statusFilter])

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage))
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredBookings, currentPage])

  // Reset page on filter/search change
  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  const getAssetName = (assetId: string) => {
    return assets.find(a => a.assetId === assetId)?.assetName || 'Unknown Resource'
  }

  const getAssetTag = (assetId: string) => {
    return assets.find(a => a.assetId === assetId)?.assetTag || '-'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      case 'cancelled': return 'bg-white/5 text-white/40 border-white/10'
      case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default: return 'bg-white/5 text-white/50 border-white/10'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bookings</h2>
          <p className="text-sm text-muted-foreground">Reserve shared resources, rooms, conference halls, and equipment.</p>
        </div>
        <Button onClick={() => navigate(ROUTES.BOOKING_CREATE)} className="gap-2 bg-primary hover:opacity-95 text-white">
          <Plus className="h-4 w-4" />
          Request Booking
        </Button>
      </div>

      {/* Bookings Card Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              placeholder="Search by tag, purpose, requester..."
              className="pl-9 w-full bg-background"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-primary min-w-[140px] w-full md:w-auto"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
              <LoaderIcon className="h-6 w-6 animate-spin text-primary" />
              <span>Fetching bookings list...</span>
            </div>
          ) : paginatedBookings.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground text-base">No Booking Requests</h3>
                <p className="text-xs">There are no reservation requests matching your filter options currently.</p>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-foreground/80">
              <thead className="border-b border-border bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Booking Number</th>
                  <th className="px-6 py-4">Target Resource</th>
                  <th className="px-6 py-4">Requested By</th>
                  <th className="px-6 py-4">Reservation Window</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-foreground">{b.bookingNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{getAssetName(b.assetId)}</span>
                        <span className="text-xs text-muted-foreground">Tag: {getAssetTag(b.assetId)} • Purpose: {b.purpose}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 opacity-60 text-primary" />
                        <span>{b.requestedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3.5 w-3.5 opacity-60" />
                        <span>
                          {formatDate(b.startDate)} - {formatDate(b.endDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border capitalize ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/bookings/${b.id}`}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(b.id)}
                              className="p-1.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5 rounded-md transition-colors"
                              title="Approve Booking"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(b.id)}
                              className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 rounded-md transition-colors"
                              title="Reject Booking"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Panel */}
        {!loading && filteredBookings.length > 0 && (
          <div className="flex items-center justify-between border-t border-border bg-muted/10 px-6 py-4">
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length}{' '}
              bookings
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 text-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-xs"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
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
