import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, AlertTriangle, Clock, User, CheckCircle2 } from 'lucide-react'
import { firestoreService } from '@/services/firestoreService'
import { assetService } from '@/services/assetService'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import type { Asset, User as UserType, Department } from '@/types'

interface AllocationHistoryEntry {
  id: string
  action: string
  employeeName: string
  department: string
  date: string
  condition: string
}

export function AllocationTransferPage() {
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const [assets, setAssets] = useState<Asset[]>([])
  const [employees, setEmployees] = useState<UserType[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [toEmployeeId, setToEmployeeId] = useState('')
  const [reason, setReason] = useState('')
  const [historyEntries, setHistoryEntries] = useState<AllocationHistoryEntry[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [allAssetsResp, allEmps, allDepts] = await Promise.all([
          assetService.getAll({ page: 1, pageSize: 500 }),
          firestoreService.getEmployees(),
          firestoreService.getDepartments()
        ])
        setAssets(allAssetsResp.data)
        setEmployees(allEmps)
        setDepartments(allDepts)
      } catch (err: any) {
        toast({ variant: 'error', title: 'Load Error', description: err.message })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getDeptName = (deptId: string | null | undefined) => {
    if (!deptId) return '—'
    return departments.find(d => d.departmentId === deptId)?.name || '—'
  }

  const getEmpName = (uid: string | null | undefined) => {
    if (!uid) return '—'
    return employees.find(e => e.uid === uid)?.name || uid
  }

  const handleAssetChange = (assetId: string) => {
    setSelectedAssetId(assetId)
    const asset = assets.find(a => a.assetId === assetId) || null
    setSelectedAsset(asset)
    setToEmployeeId('')
    setReason('')

    // Build mock allocation history from asset data
    if (asset) {
      const history: AllocationHistoryEntry[] = []
      if (asset.assignedTo) {
        history.push({
          id: '1',
          action: 'Allocated',
          employeeName: getEmpName(asset.assignedTo),
          department: getDeptName(
            employees.find(e => e.uid === asset.assignedTo)?.departmentId
          ),
          date: asset.updatedAt || asset.createdAt || '',
          condition: asset.condition || 'Good'
        })
      }
      setHistoryEntries(history)
    } else {
      setHistoryEntries([])
    }
  }

  const isAlreadyAllocated = selectedAsset?.status === 'Allocated'
  const fromEmployee = isAlreadyAllocated
    ? employees.find(e => e.uid === selectedAsset?.assignedTo)
    : null
  const fromDept = fromEmployee ? getDeptName(fromEmployee.departmentId) : '—'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssetId || !toEmployeeId) {
      toast({ variant: 'error', title: 'Validation', description: 'Please select an asset and a target employee.' })
      return
    }
    setSubmitting(true)
    try {
      await assetService.update(selectedAssetId, {
        assignedTo: toEmployeeId,
        status: 'Allocated',
        updatedAt: new Date().toISOString()
      })
      toast({ variant: 'success', title: isAlreadyAllocated ? 'Transfer Submitted' : 'Asset Allocated', description: 'The assignment has been updated successfully.' })
      setSelectedAssetId('')
      setSelectedAsset(null)
      setToEmployeeId('')
      setReason('')
      setHistoryEntries([])
      // Refresh assets list
      const resp = await assetService.getAll({ page: 1, pageSize: 500 })
      setAssets(resp.data)
    } catch (err: any) {
      toast({ variant: 'error', title: 'Error', description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-white/40">Loading allocation data...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Allocation & Transfer</h2>
        <p className="text-sm text-white/60">Allocate assets to employees or submit transfer requests when an asset is already in use.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#0c0c0f] p-6 space-y-5">
            {/* Asset Selector */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Select Asset</label>
              <select
                value={selectedAssetId}
                onChange={e => handleAssetChange(e.target.value)}
                className="w-full h-11 rounded-lg border border-white/10 bg-[#111115] px-3 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a registered asset...</option>
                {assets.map(a => (
                  <option key={a.assetId} value={a.assetId}>
                    {a.assetTag} – {a.assetName} ({a.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Double-Allocation Collision Alert */}
            {isAlreadyAllocated && fromEmployee && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-rose-300">
                      Already Allocated to {fromEmployee.name} ({fromDept})
                    </p>
                    <p className="text-xs text-rose-400/80 mt-0.5">
                      Direct re-allocation is blocked — submit a transfer request below.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Transfer / Allocation Form */}
            {selectedAsset && (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 pt-2 border-t border-white/8"
              >
                <h3 className="text-sm font-semibold text-white/80">
                  {isAlreadyAllocated ? 'Transfer Request' : 'Allocate Asset'}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {isAlreadyAllocated && (
                    <div>
                      <label className="text-xs text-white/45 mb-1.5 block">From</label>
                      <div className="h-10 flex items-center px-3 rounded-lg border border-white/8 bg-white/5 text-sm text-white/60">
                        {fromEmployee?.name || '—'}
                      </div>
                    </div>
                  )}
                  <div className={isAlreadyAllocated ? '' : 'col-span-2'}>
                    <label className="text-xs text-white/45 mb-1.5 block">
                      {isAlreadyAllocated ? 'To' : 'Assign To'}
                    </label>
                    <select
                      required
                      value={toEmployeeId}
                      onChange={e => setToEmployeeId(e.target.value)}
                      className="w-full h-10 rounded-lg border border-white/10 bg-[#111115] px-3 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Employee...</option>
                      {employees
                        .filter(emp => emp.uid !== selectedAsset?.assignedTo)
                        .map(emp => (
                          <option key={emp.uid} value={emp.uid}>
                            {emp.name} — {getDeptName(emp.departmentId)}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                {isAlreadyAllocated && (
                  <div>
                    <label className="text-xs text-white/45 mb-1.5 block">Reason for Transfer</label>
                    <textarea
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="Explain why this transfer is needed..."
                      className="w-full min-h-[80px] rounded-lg border border-white/10 bg-[#111115] px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  {submitting ? 'Processing...' : isAlreadyAllocated ? 'Submit Transfer Request' : 'Allocate Asset'}
                </Button>
              </motion.form>
            )}
          </div>

          {/* Allocation History */}
          {selectedAsset && (
            <div className="rounded-xl border border-white/10 bg-[#0c0c0f] p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" /> Allocation History
              </h3>
              {historyEntries.length === 0 ? (
                <p className="text-xs text-white/40">No previous allocation records for this asset.</p>
              ) : (
                <ul className="space-y-3">
                  {historyEntries.map(entry => (
                    <li key={entry.id} className="flex items-start gap-3 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white/80 font-medium">{entry.action}</span>
                        <span className="text-white/50"> to {entry.employeeName} — {entry.department}</span>
                        {entry.date && (
                          <span className="text-white/30 ml-2">
                            {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right: Stats Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#0c0c0f] p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" /> Asset Overview
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Total Assets', value: assets.length, color: 'text-white' },
                { label: 'Available', value: assets.filter(a => a.status === 'Available').length, color: 'text-emerald-400' },
                { label: 'Allocated', value: assets.filter(a => a.status === 'Allocated').length, color: 'text-indigo-400' },
                { label: 'Under Maintenance', value: assets.filter(a => a.status === 'Under Maintenance').length, color: 'text-amber-400' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between text-sm">
                  <span className="text-white/50">{stat.label}</span>
                  <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Allocated */}
          <div className="rounded-xl border border-white/10 bg-[#0c0c0f] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Recently Allocated</h3>
            <ul className="space-y-3">
              {assets
                .filter(a => a.status === 'Allocated' && a.assignedTo)
                .slice(0, 5)
                .map(a => (
                  <li key={a.assetId} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-semibold text-white/80">{a.assetTag}</span>
                      <span className="text-white/40 ml-2">{a.assetName}</span>
                    </div>
                    <span className="text-white/40">{getEmpName(a.assignedTo)}</span>
                  </li>
                ))
              }
              {assets.filter(a => a.status === 'Allocated').length === 0 && (
                <li className="text-xs text-white/30">No allocated assets yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
