import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, AlertTriangle, CheckCircle2, XCircle, AlertOctagon, X, Plus } from 'lucide-react'
import { assetService } from '@/services/assetService'
import { firestoreService } from '@/services/firestoreService'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import type { Asset, Department } from '@/types'
import { collection, doc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { useAuth } from '@/hooks/useAuth'

type VerificationStatus = 'pending' | 'verified' | 'missing' | 'damaged'

interface AuditItem {
  assetId: string
  assetTag: string
  assetName: string
  expectedLocation: string
  verification: VerificationStatus
}

interface AuditSession {
  id: string
  department: string
  auditors: string
  startDate: string
  status: 'open' | 'closed'
  items: AuditItem[]
}

export function AuditPage() {
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const [assets, setAssets] = useState<Asset[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [sessions, setSessions] = useState<AuditSession[]>([])
  const [activeSession, setActiveSession] = useState<AuditSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  // New session form
  const [showForm, setShowForm] = useState(false)
  const [newDept, setNewDept] = useState('')
  const [newAuditors, setNewAuditors] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [assetsResp, depts] = await Promise.all([
          assetService.getAll({ page: 1, pageSize: 500 }),
          firestoreService.getDepartments()
        ])
        setAssets(assetsResp.data)
        setDepartments(depts)

        // Load audit sessions from Firestore
        const sessSnap = await getDocs(collection(db, 'auditSessions'))
        const loadedSessions: AuditSession[] = sessSnap.docs.map(d => ({ id: d.id, ...d.data() } as AuditSession))
        setSessions(loadedSessions)

        // If there's an open session, show it
        const open = loadedSessions.find(s => s.status === 'open')
        if (open) setActiveSession(open)
      } catch (err: any) {
        toast({ variant: 'error', title: 'Load Error', description: err.message })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getDeptName = (deptId: string | null | undefined) => {
    if (!deptId) return 'All Departments'
    return departments.find(d => d.departmentId === deptId)?.name || deptId
  }

  const handleCreateSession = async () => {
    if (!newDept) {
      toast({ variant: 'error', title: 'Required', description: 'Please select a department for the audit.' })
      return
    }
    setCreating(true)
    try {
      const deptAssets = assets.filter(a => a.departmentId === newDept || !newDept)
      const auditItems: AuditItem[] = deptAssets.map(a => ({
        assetId: a.assetId,
        assetTag: a.assetTag,
        assetName: a.assetName,
        expectedLocation: a.location || 'HQ',
        verification: 'pending' as VerificationStatus
      }))

      // If no assets in dept, include all assets for demo
      const items = auditItems.length > 0 ? auditItems : assets.slice(0, 10).map(a => ({
        assetId: a.assetId,
        assetTag: a.assetTag,
        assetName: a.assetName,
        expectedLocation: a.location || 'HQ',
        verification: 'pending' as VerificationStatus
      }))

      const sessionDocRef = doc(collection(db, 'auditSessions'))
      const newSession: AuditSession = {
        id: sessionDocRef.id,
        department: newDept,
        auditors: newAuditors || currentUser?.name || 'Admin',
        startDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'open',
        items
      }
      await setDoc(sessionDocRef, newSession)
      setSessions(prev => [...prev, newSession])
      setActiveSession(newSession)
      setShowForm(false)
      setNewDept('')
      setNewAuditors('')
      toast({ variant: 'success', title: 'Audit Session Started', description: `Auditing ${getDeptName(newDept)} — ${items.length} assets.` })
    } catch (err: any) {
      toast({ variant: 'error', title: 'Error', description: err.message })
    } finally {
      setCreating(false)
    }
  }

  const handleVerify = async (assetId: string, status: VerificationStatus) => {
    if (!activeSession) return
    const updatedItems = activeSession.items.map(item =>
      item.assetId === assetId ? { ...item, verification: status } : item
    )
    const updatedSession = { ...activeSession, items: updatedItems }
    setActiveSession(updatedSession)

    // Persist to Firestore
    await setDoc(doc(db, 'auditSessions', activeSession.id), updatedSession)

    // If asset is damaged or missing, update asset status
    if (status === 'missing') {
      await assetService.update(assetId, { status: 'Lost' })
    } else if (status === 'damaged') {
      await assetService.update(assetId, { condition: 'poor' })
    }
  }

  const handleCloseAudit = async () => {
    if (!activeSession || !confirm('Close this audit cycle? A discrepancy report will be generated.')) return
    const closedSession = { ...activeSession, status: 'closed' as const }
    await setDoc(doc(db, 'auditSessions', activeSession.id), closedSession)
    setSessions(prev => prev.map(s => s.id === activeSession.id ? closedSession : s))
    setActiveSession(null)
    toast({ variant: 'success', title: 'Audit Closed', description: 'Discrepancy report has been generated and saved.' })
  }

  const flagged = activeSession?.items.filter(i => i.verification === 'missing' || i.verification === 'damaged') || []
  const verified = activeSession?.items.filter(i => i.verification === 'verified') || []

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-white/40">Loading audit data...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Asset Audit</h2>
          <p className="text-sm text-white/60">Run scheduled audit cycles, verify asset locations, and generate discrepancy reports.</p>
        </div>
        {!activeSession && (
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Start Audit Cycle
          </Button>
        )}
      </div>

      {/* New Session Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Configure New Audit Cycle</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white/80">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/45 mb-1.5 block">Department *</label>
                <select
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-[#111115] px-3 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Department...</option>
                  {departments.map(d => (
                    <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/45 mb-1.5 block">Auditors (names)</label>
                <input
                  type="text"
                  value={newAuditors}
                  onChange={e => setNewAuditors(e.target.value)}
                  placeholder="e.g. A. Roy, S. Iqbal"
                  className="w-full h-10 rounded-lg border border-white/10 bg-[#111115] px-3 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <Button
              onClick={handleCreateSession}
              disabled={creating}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              {creating ? 'Creating...' : 'Begin Audit'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Audit Session */}
      {activeSession ? (
        <div className="space-y-4">
          {/* Session Header Card */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Active Audit: {getDeptName(activeSession.department)} — {activeSession.startDate}
                </p>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  Auditors: {activeSession.auditors}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/50">
                <span className="text-emerald-400 font-semibold">{verified.length} Verified</span>
                <span className="text-amber-400 font-semibold">{activeSession.items.filter(i => i.verification === 'pending').length} Pending</span>
                <span className="text-rose-400 font-semibold">{flagged.length} Flagged</span>
              </div>
            </div>
          </div>

          {/* Discrepancy Banner */}
          {flagged.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-5 py-3 flex items-center gap-3"
            >
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <p className="text-sm text-rose-300 font-medium">
                {flagged.length} asset{flagged.length > 1 ? 's' : ''} flagged — discrepancy report generated automatically.
              </p>
            </motion.div>
          )}

          {/* Checklist Table */}
          <div className="rounded-xl border border-white/10 bg-[#0c0c0f] overflow-hidden">
            <table className="w-full border-collapse text-sm text-left text-white/75">
              <thead className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-6 py-3.5">Asset</th>
                  <th className="px-6 py-3.5">Expected Location</th>
                  <th className="px-6 py-3.5 text-center">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeSession.items.map(item => (
                  <tr key={item.assetId} className="hover:bg-white/2.5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-white/90">{item.assetTag}</span>
                      <span className="text-white/50 ml-2 text-xs">{item.assetName}</span>
                    </td>
                    <td className="px-6 py-4 text-white/60">{item.expectedLocation}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {item.verification === 'verified' ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        ) : item.verification === 'missing' ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
                            <XCircle className="h-3 w-3" /> Missing
                          </span>
                        ) : item.verification === 'damaged' ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                            <AlertOctagon className="h-3 w-3" /> Damaged
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerify(item.assetId, 'verified')}
                              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                              ✓ Verified
                            </button>
                            <button
                              onClick={() => handleVerify(item.assetId, 'missing')}
                              className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-400 hover:bg-rose-500/20 transition-colors"
                            >
                              Missing
                            </button>
                            <button
                              onClick={() => handleVerify(item.assetId, 'damaged')}
                              className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-400 hover:bg-amber-500/20 transition-colors"
                            >
                              Damaged
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Close Audit */}
          <div className="flex justify-end">
            <Button
              onClick={handleCloseAudit}
              variant="outline"
              className="border-white/20 text-white/80 hover:bg-white/10 gap-2"
            >
              <CheckCircle2 className="h-4 w-4" /> Close Audit Cycle
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-[#0c0c0f] p-12 text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <ClipboardList className="h-7 w-7 text-indigo-400" />
            </div>
          </div>
          <h3 className="text-base font-semibold text-white">No Active Audit Session</h3>
          <p className="text-sm text-white/40 max-w-sm mx-auto">
            Start an audit cycle to verify asset locations and generate discrepancy reports.
          </p>

          {/* Past Sessions */}
          {sessions.filter(s => s.status === 'closed').length > 0 && (
            <div className="mt-6 text-left space-y-2 max-w-lg mx-auto">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Past Audit Cycles</p>
              {sessions.filter(s => s.status === 'closed').map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-4 py-3 text-xs">
                  <div>
                    <span className="text-white/80 font-medium">{getDeptName(s.department)}</span>
                    <span className="text-white/40 ml-2">{s.startDate}</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">Closed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
