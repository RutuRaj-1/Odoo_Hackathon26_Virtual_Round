import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Wrench,
  Search,
  Plus,
  Clock,
  User,
  CheckCircle,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  AlertTriangle,
  BadgeAlert
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { maintenanceService } from '@/services/maintenanceService'
import { firestoreService } from '@/services/firestoreService'
import type { MaintenanceRecord, Asset } from '@/types'
import { ROUTES } from '@/constants'
import { formatDate } from '@/utils'

export function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceRecord[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const { toast } = useToast()
  const navigate = useNavigate()

  const loadData = async () => {
    try {
      const [ticketsResponse, assetsData] = await Promise.all([
        maintenanceService.getAll({ page: 1, pageSize: 500 }),
        firestoreService.getAssets()
      ])
      setTickets(ticketsResponse.data)
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

  // Complete maintenance ticket handler
  const handleComplete = async (id: string) => {
    const costInput = prompt('Please enter the actual maintenance cost (numeric, optional):')
    if (costInput === null) return
    const actualCost = costInput ? parseFloat(costInput) : undefined
    
    try {
      await maintenanceService.complete(id, actualCost)
      toast({ variant: 'success', title: 'Ticket Resolved', description: 'Asset marked as Available and maintenance record archived.' })
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  // Filter logic
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const asset = assets.find(a => a.assetId === t.assetId)
      const assetName = asset ? asset.assetName.toLowerCase() : ''
      const matchesSearch =
        t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assetName.includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter ? t.status === statusFilter : true
      const matchesPriority = priorityFilter ? t.priority === priorityFilter : true

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tickets, assets, searchTerm, statusFilter, priorityFilter])

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage))
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTickets, currentPage])

  // Reset page on filter/search change
  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  const getAssetName = (assetId: string) => {
    return assets.find(a => a.assetId === assetId)?.assetName || 'Unknown Asset'
  }

  const getAssetTag = (assetId: string) => {
    return assets.find(a => a.assetId === assetId)?.assetTag || '-'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'in_progress': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'overdue': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      case 'cancelled': return 'bg-white/5 text-white/40 border-white/10'
      default: return 'bg-white/5 text-white/50 border-white/10'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-white/5 text-white/60'
      case 'medium': return 'bg-blue-500/10 text-blue-400'
      case 'high': return 'bg-orange-500/10 text-orange-400'
      case 'critical': return 'bg-red-500/10 text-red-400 animate-pulse border border-red-500/30'
      default: return 'bg-white/5 text-white/50'
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
          <h2 className="text-2xl font-bold text-foreground">Maintenance</h2>
          <p className="text-sm text-muted-foreground">Log incident reports, assign repair teams, and control device health logs.</p>
        </div>
        <Button onClick={() => navigate(ROUTES.MAINTENANCE_CREATE)} className="gap-2 bg-primary hover:opacity-95 text-white">
          <Plus className="h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Maintenance Cards & Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              placeholder="Search tickets by asset or issue..."
              className="pl-9 w-full bg-background"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => handleFilterChange(setPriorityFilter, e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-primary min-w-[130px]"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-primary min-w-[130px]"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
              <LoaderIcon className="h-6 w-6 animate-spin text-primary" />
              <span>Fetching maintenance tickets...</span>
            </div>
          ) : paginatedTickets.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground text-base">No Incident Tickets</h3>
                <p className="text-xs">There are no maintenance requests matching your filter options currently.</p>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-foreground/80">
              <thead className="border-b border-border bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Technical Issue</th>
                  <th className="px-6 py-4">Scheduled Date</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-foreground">{t.ticketNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{getAssetName(t.assetId)}</span>
                        <span className="text-xs text-muted-foreground">Tag: {getAssetTag(t.assetId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-xs">
                        <span className="font-semibold text-foreground truncate">{t.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{t.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3.5 w-3.5 opacity-60" />
                        <span>{formatDate(t.scheduledDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${getPriorityColor(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border capitalize ${getStatusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/maintenance/${t.id}`}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {t.status !== 'completed' && t.status !== 'cancelled' && (
                          <button
                            onClick={() => handleComplete(t.id)}
                            className="p-1.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5 rounded-md transition-colors"
                            title="Resolve Ticket"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
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
        {!loading && filteredTickets.length > 0 && (
          <div className="flex items-center justify-between border-t border-border bg-muted/10 px-6 py-4">
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length}{' '}
              tickets
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
