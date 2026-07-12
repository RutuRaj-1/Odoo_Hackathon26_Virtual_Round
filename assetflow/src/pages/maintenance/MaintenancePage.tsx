import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Wrench, Plus, User, Play, CheckCircle, Check, X, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { maintenanceService } from '@/services/maintenanceService'
import { firestoreService } from '@/services/firestoreService'
import type { MaintenanceRecord, Asset } from '@/types'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'

type KanbanColumn = {
  id: string
  label: string
  color: string
  bgColor: string
  borderColor: string
  cardBg: string
}

const COLUMNS: KanbanColumn[] = [
  { id: 'pending',             label: 'Pending',           color: 'text-amber-400',  bgColor: 'bg-amber-500/10',  borderColor: 'border-amber-500/20',  cardBg: 'bg-amber-500/5'  },
  { id: 'approved',            label: 'Approved',          color: 'text-blue-400',   bgColor: 'bg-blue-500/10',   borderColor: 'border-blue-500/20',   cardBg: 'bg-blue-500/5'   },
  { id: 'technician_assigned', label: 'Technician Assigned', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20', cardBg: 'bg-indigo-500/5' },
  { id: 'in_progress',         label: 'In Progress',       color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20', cardBg: 'bg-orange-500/5' },
  { id: 'resolved',            label: 'Resolved',          color: 'text-emerald-400',bgColor: 'bg-emerald-500/10',borderColor: 'border-emerald-500/20',cardBg: 'bg-emerald-500/20'},
]

export function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceRecord[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

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
    return () => { if (unsubTickets) unsubTickets() }
  }, [toast])

  const handleApprove = async (id: string) => {
    if (!currentUser) return
    try {
      await maintenanceService.approveRequest(id, currentUser.uid)
      toast({ variant: 'success', title: 'Approved', description: 'Asset moved to Under Maintenance.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleReject = async (id: string) => {
    if (!currentUser) return
    if (!confirm('Reject this maintenance request?')) return
    try {
      await maintenanceService.rejectRequest(id, currentUser.uid)
      toast({ variant: 'success', title: 'Rejected', description: 'Maintenance request rejected.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleAssign = async (id: string) => {
    if (!currentUser) return
    const tech = prompt('Enter Technician name/ID (blank = self-assign):')
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
      toast({ variant: 'success', title: 'Started', description: 'Work is now in progress.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleComplete = async (id: string) => {
    if (!currentUser) return
    const cost = prompt('Actual repair cost (optional):')
    const notes = prompt('Resolution notes:')
    const actualCost = cost ? parseFloat(cost) : undefined
    try {
      await maintenanceService.resolveRequest(id, currentUser.uid, notes || '', actualCost)
      toast({ variant: 'success', title: 'Resolved', description: 'Asset restored to Available status.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const getAssetTag = (assetId: string) => assets.find(a => a.assetId === assetId)?.assetTag || '—'
  const getAssetName = (assetId: string) => assets.find(a => a.assetId === assetId)?.assetName || 'Unknown'

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-blue-400'
      default: return 'bg-white/20'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-white/40">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mr-3" />
        Loading maintenance board...
      </div>
    )
  }

  const allOpen = tickets.filter(t => t.status !== 'resolved' && t.status !== 'rejected')
  const openCount = allOpen.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Maintenance</h2>
          <p className="text-sm text-white/60">
            Approval workflow board — {openCount} open ticket{openCount !== 1 ? 's' : ''}.
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.MAINTENANCE_CREATE)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4" /> Raise Request
        </Button>
      </div>

      {/* Legend */}
      <div className="rounded-lg border border-white/8 bg-[#0c0c0f] px-5 py-3 text-xs text-white/50">
        <span className="text-indigo-400 font-medium">Approving</span> a card moves the asset to <em>Under Maintenance</em>;{' '}
        <span className="text-emerald-400 font-medium">Resolving</span> returns it to <em>Available</em>.
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map(col => {
            const colTickets = tickets.filter(t => t.status === col.id)
            return (
              <div key={col.id} className="flex flex-col w-60 shrink-0">
                {/* Column Header */}
                <div className={`rounded-t-xl border ${col.borderColor} ${col.bgColor} px-4 py-3 flex items-center justify-between`}>
                  <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                  <span className={`text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${col.bgColor} ${col.color}`}>
                    {colTickets.length}
                  </span>
                </div>

                {/* Cards */}
                <div className={`flex-1 min-h-48 rounded-b-xl border-l border-r border-b ${col.borderColor} bg-[#0c0c0f] p-2 space-y-2`}>
                  {colTickets.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-xs text-white/20">
                      No tickets
                    </div>
                  ) : (
                    colTickets.map(ticket => (
                      <motion.div
                        key={ticket.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-lg border ${col.borderColor} ${col.cardBg} p-3 space-y-2 cursor-pointer group`}
                        onClick={() => navigate(`${ROUTES.MAINTENANCE}/${ticket.id}`)}
                      >
                        {/* Asset Tag + Priority */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-white/90">
                            {getAssetTag(ticket.assetId)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${getPriorityDot(ticket.priority)}`} title={ticket.priority} />
                          </div>
                        </div>

                        {/* Title */}
                        <p className="text-xs text-white/75 leading-tight line-clamp-2">
                          {getAssetName(ticket.assetId)} — {ticket.title}
                        </p>

                        {/* Technician if assigned */}
                        {ticket.assignedTechnician && (
                          <p className="text-[10px] text-white/40">
                            Tech: {ticket.assignedTechnician.length > 12
                              ? ticket.assignedTechnician.substring(0, 12) + '…'
                              : ticket.assignedTechnician}
                          </p>
                        )}

                        {/* Resolution date */}
                        {ticket.status === 'resolved' && ticket.completedDate && (
                          <p className="text-[10px] text-emerald-400">
                            Resolved {new Date(ticket.completedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </p>
                        )}

                        {/* Quick Action Buttons */}
                        <div className="flex gap-1.5 pt-1 border-t border-white/8" onClick={e => e.stopPropagation()}>
                          {ticket.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(ticket.id)}
                                className="flex-1 flex items-center justify-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/20 py-1 text-[10px] text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                                title="Approve"
                              >
                                <Check className="h-3 w-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleReject(ticket.id)}
                                className="flex-1 flex items-center justify-center gap-1 rounded-md bg-rose-500/15 border border-rose-500/20 py-1 text-[10px] text-rose-400 hover:bg-rose-500/25 transition-colors"
                                title="Reject"
                              >
                                <X className="h-3 w-3" /> Reject
                              </button>
                            </>
                          )}
                          {ticket.status === 'approved' && (
                            <button
                              onClick={() => handleAssign(ticket.id)}
                              className="flex-1 flex items-center justify-center gap-1 rounded-md bg-indigo-500/15 border border-indigo-500/20 py-1 text-[10px] text-indigo-400 hover:bg-indigo-500/25 transition-colors"
                            >
                              <User className="h-3 w-3" /> Assign Tech
                            </button>
                          )}
                          {ticket.status === 'technician_assigned' && (
                            <button
                              onClick={() => handleStartWork(ticket.id)}
                              className="flex-1 flex items-center justify-center gap-1 rounded-md bg-orange-500/15 border border-orange-500/20 py-1 text-[10px] text-orange-400 hover:bg-orange-500/25 transition-colors"
                            >
                              <Play className="h-3 w-3" /> Start
                            </button>
                          )}
                          {ticket.status === 'in_progress' && (
                            <button
                              onClick={() => handleComplete(ticket.id)}
                              className="flex-1 flex items-center justify-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/20 py-1 text-[10px] text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3" /> Resolve
                            </button>
                          )}
                          <Link
                            to={`${ROUTES.MAINTENANCE}/${ticket.id}`}
                            className="flex items-center justify-center rounded-md bg-white/5 border border-white/10 px-2 py-1 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                            title="View Details"
                          >
                            <Info className="h-3 w-3" />
                          </Link>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
