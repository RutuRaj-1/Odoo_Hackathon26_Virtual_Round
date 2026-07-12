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
  Play,
  Check,
  X
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
import { useAuth } from '@/hooks/useAuth'

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
  const { currentUser } = useAuth()

  useEffect(() => {
    let unsubTickets: (() => void) | undefined
    const loadData = async () => {
      try {
        const assetsData = await firestoreService.getAssets()
        setAssets(assetsData)
        
        unsubTickets = maintenanceService.subscribeToMaintenanceRecords((records) => {
          setTickets(records)
          setLoading(false)
        })
      } catch (error: any) {
        toast({ variant: 'error', title: 'Fetch Error', description: error.message })
        setLoading(false)
      }
    }
    loadData()
    return () => {
      if (unsubTickets) unsubTickets()
    }
  }, [toast])

  const handleApprove = async (id: string) => {
    if (!currentUser) return
    try {
      await maintenanceService.approveRequest(id, currentUser.uid)
      toast({ variant: 'success', title: 'Approved', description: 'Asset marked Under Maintenance.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleReject = async (id: string) => {
    if (!currentUser) return
    if (!confirm('Are you sure you want to reject this request?')) return
    try {
      await maintenanceService.rejectRequest(id, currentUser.uid)
      toast({ variant: 'success', title: 'Rejected', description: 'Maintenance request rejected.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleAssign = async (id: string) => {
    if (!currentUser) return
    // Simplification for assignment - assigning to current user for demo purposes, or prompt
    const tech = prompt('Enter Technician User ID or leave blank to self-assign:')
    const techId = tech || currentUser.uid
    try {
      await maintenanceService.assignTechnician(id, techId, currentUser.uid)
      toast({ variant: 'success', title: 'Assigned', description: 'Technician assigned successfully.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleStartWork = async (id: string) => {
    try {
      await maintenanceService.startWork(id)
      toast({ variant: 'success', title: 'Started', description: 'Maintenance work in progress.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleComplete = async (id: string) => {
    if (!currentUser) return
    const costInput = prompt('Enter actual cost (numeric, optional):')
    const notesInput = prompt('Enter resolution notes:')
    const actualCost = costInput ? parseFloat(costInput) : undefined
    
    try {
      await maintenanceService.resolveRequest(id, currentUser.uid, notesInput || '', actualCost)
      toast({ variant: 'success', title: 'Ticket Resolved', description: 'Asset restored to Available.' })
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
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [tickets, assets, searchTerm, statusFilter, priorityFilter])

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage))
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTickets, currentPage])

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
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'approved': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      case 'technician_assigned': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      case 'in_progress': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Maintenance</h2>
          <p className="text-sm text-white/60">Log incident reports, assign repair teams, and track asset repairs.</p>
        </div>
        <Button onClick={() => navigate(ROUTES.MAINTENANCE_CREATE)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4" />
          Raise Request
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0c0c0f] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              placeholder="Search tickets by asset or issue..."
              className="pl-9 w-full bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select
              value={priorityFilter}
              onChange={(e) => handleFilterChange(setPriorityFilter, e.target.value)}
              className="h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 min-w-[130px]"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 min-w-[130px]"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="technician_assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center text-sm text-white/50 flex flex-col items-center gap-3">
              <span>Fetching maintenance tickets...</span>
            </div>
          ) : paginatedTickets.length === 0 ? (
            <div className="py-20 text-center text-sm text-white/40">
              <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
                <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-white text-base">No Incident Tickets</h3>
                <p className="text-xs">There are no maintenance requests matching your filters.</p>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-white/80">
              <thead className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Technical Issue</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white">{t.ticketNumber}</span>
                      <br/>
                      <span className="text-xs text-white/40">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{getAssetName(t.assetId)}</span>
                        <span className="text-xs text-white/40">Tag: {getAssetTag(t.assetId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-xs">
                        <span className="font-semibold text-white truncate">{t.title}</span>
                        <span className="text-xs text-white/40 truncate">{t.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${getPriorityColor(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border capitalize ${getStatusColor(t.status)}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {t.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(t.id)} className="p-1.5 text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors" title="Approve">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleReject(t.id)} className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors" title="Reject">
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {t.status === 'approved' && (
                          <button onClick={() => handleAssign(t.id)} className="p-1.5 text-white/40 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-md transition-colors" title="Assign Technician">
                            <User className="h-4 w-4" />
                          </button>
                        )}
                        {t.status === 'technician_assigned' && (
                          <button onClick={() => handleStartWork(t.id)} className="p-1.5 text-white/40 hover:text-orange-400 hover:bg-orange-400/10 rounded-md transition-colors" title="Start Work">
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {t.status === 'in_progress' && (
                          <button onClick={() => handleComplete(t.id)} className="p-1.5 text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors" title="Resolve Ticket">
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

        {!loading && filteredTickets.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-6 py-4">
            <span className="text-xs text-white/40">
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
                className="h-8 px-3 text-xs border-white/10 bg-transparent text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-xs border-white/10 bg-transparent text-white hover:bg-white/10"
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
