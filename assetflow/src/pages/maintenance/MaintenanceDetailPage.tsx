import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wrench, Check, X, User, Play, CheckCircle } from 'lucide-react'
import { ROUTES } from '@/constants'
import { maintenanceService } from '@/services/maintenanceService'
import { assetService } from '@/services/assetService'
import type { MaintenanceRecord, Asset } from '@/types'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils'
import { useAuth } from '@/hooks/useAuth'

export function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const [ticket, setTicket] = useState<MaintenanceRecord | null>(null)
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const allTickets = await new Promise<MaintenanceRecord[]>((resolve) => {
        const unsub = maintenanceService.subscribeToMaintenanceRecords((records) => {
          unsub()
          resolve(records)
        })
      })
      const foundTicket = allTickets.find((t) => t.id === id)
      if (!foundTicket) throw new Error('Maintenance request not found.')
      
      setTicket(foundTicket)
      const assetData = await assetService.getById(foundTicket.assetId)
      setAsset(assetData)
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error loading ticket', description: error.message })
      navigate(ROUTES.MAINTENANCE)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleApprove = async () => {
    if (!id || !currentUser) return
    try {
      await maintenanceService.approveRequest(id, currentUser.uid)
      toast({ variant: 'success', title: 'Ticket Approved', description: 'Asset status set to Under Maintenance.' })
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleReject = async () => {
    if (!id || !currentUser) return
    try {
      await maintenanceService.rejectRequest(id, currentUser.uid)
      toast({ variant: 'warning', title: 'Ticket Rejected', description: 'Request status updated.' })
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleAssign = async () => {
    if (!id || !currentUser) return
    const tech = prompt('Enter Technician User ID or leave blank to self-assign:')
    const techId = tech || currentUser.uid
    try {
      await maintenanceService.assignTechnician(id, techId, currentUser.uid)
      toast({ variant: 'success', title: 'Assigned', description: 'Technician has been assigned to this ticket.' })
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleStartWork = async () => {
    if (!id) return
    try {
      await maintenanceService.startWork(id)
      toast({ variant: 'success', title: 'Work Started', description: 'Status updated to In Progress.' })
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  const handleComplete = async () => {
    if (!id || !currentUser) return
    const costInput = prompt('Enter actual cost (numeric, optional):')
    const notesInput = prompt('Enter resolution notes:')
    const actualCost = costInput ? parseFloat(costInput) : undefined

    try {
      await maintenanceService.resolveRequest(id, currentUser.uid, notesInput || '', actualCost)
      toast({ variant: 'success', title: 'Ticket Resolved', description: 'Asset restored to Available status.' })
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading ticket details...</div>
  }

  if (!ticket) return null

  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-3xl"
    >
      <div className="flex items-center justify-between">
        <Link to={ROUTES.MAINTENANCE} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Maintenance
        </Link>

        <div className="flex gap-2">
          {ticket.status === 'pending' && isManager && (
            <>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={handleApprove}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button size="sm" variant="destructive" className="gap-1.5" onClick={handleReject}>
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
            </>
          )}
          {ticket.status === 'approved' && isManager && (
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5" onClick={handleAssign}>
              <User className="h-3.5 w-3.5" /> Assign Technician
            </Button>
          )}
          {ticket.status === 'technician_assigned' && (
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5" onClick={handleStartWork}>
              <Play className="h-3.5 w-3.5" /> Start Repair
            </Button>
          )}
          {ticket.status === 'in_progress' && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={handleComplete}>
              <CheckCircle className="h-3.5 w-3.5" /> Resolve Incident
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
          <Wrench className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{ticket.ticketNumber}</h2>
          <p className="text-sm text-white/60">Incident Resolution Log</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-white/8 bg-[#0c0c0f] p-6 text-white text-sm">
        <div className="space-y-4">
          <div>
            <span className="text-white/40 block text-xs">Incident Asset</span>
            <span className="font-semibold text-white/95">{asset?.assetName || 'Unknown Asset'}</span>
            <span className="text-xs text-white/50 block mt-0.5">Tag: {asset?.assetTag || '-'}</span>
          </div>

          <div>
            <span className="text-white/40 block text-xs">Issue Description</span>
            <p className="text-white/80 leading-relaxed mt-1 font-semibold">{ticket.title}</p>
            <p className="text-white/60 leading-relaxed mt-1">{ticket.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-white/40 block text-xs">Priority</span>
            <span className="font-semibold text-white/95 capitalize">{ticket.priority}</span>
          </div>

          <div>
            <span className="text-white/40 block text-xs">Ticket Status</span>
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border capitalize mt-1 ${
                ticket.status === 'pending'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : ticket.status === 'resolved'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : ticket.status === 'rejected'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-white/5 text-white/30 border-white/10'
              }`}
            >
              {ticket.status}
            </span>
          </div>

          {ticket.notes && (
            <div>
              <span className="text-white/40 block text-xs">Resolution Notes</span>
              <p className="text-white/80 mt-1 leading-relaxed">{ticket.notes}</p>
            </div>
          )}

          {ticket.actualCost !== undefined && ticket.actualCost !== null && (
            <div>
              <span className="text-white/40 block text-xs">Resolution Cost</span>
              <span className="font-semibold text-white/95">${ticket.actualCost.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
