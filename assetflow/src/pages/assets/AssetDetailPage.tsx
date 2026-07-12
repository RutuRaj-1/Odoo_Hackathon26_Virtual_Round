import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Edit, Trash2, Calendar, MapPin, Hash, CheckCircle, Tag, DollarSign, User as UserIcon, Activity, RefreshCw } from 'lucide-react'
import { ROUTES } from '@/constants'
import { firestoreService } from '@/services/firestoreService'
import type { Asset, Department, AssetCategoryDoc, User, ActivityLog, Allocation } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [asset, setAsset] = useState<Asset | null>(null)
  const [department, setDepartment] = useState<Department | null>(null)
  const [category, setCategory] = useState<AssetCategoryDoc | null>(null)
  const [assignedUser, setAssignedUser] = useState<User | null>(null)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [activeAlloc, setActiveAlloc] = useState<Allocation | null>(null)

  const [allUsers, setAllUsers] = useState<User[]>([])

  // Modal States
  const [showAllocate, setShowAllocate] = useState(false)
  const [showReturn, setShowReturn] = useState(false)
  
  const [allocateUser, setAllocateUser] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [returnNotes, setReturnNotes] = useState('')
  
  const loadData = async () => {
    if (!id) return
    try {
      const [assets, depts, cats, users, activityLogs, alloc] = await Promise.all([
        firestoreService.getAssets(),
        firestoreService.getDepartments(),
        firestoreService.getCategories(),
        firestoreService.getEmployees(),
        firestoreService.getAssetActivityLogs(id),
        firestoreService.getActiveAllocation(id)
      ])
      
      const foundAsset = assets.find(a => a.assetId === id)
      if (!foundAsset) {
        toast({ variant: 'error', title: 'Not Found', description: 'Asset not found.' })
        navigate(ROUTES.ASSETS)
        return
      }
      
      setAllUsers(users)
      setAsset(foundAsset)
      if (foundAsset.departmentId) setDepartment(depts.find(d => d.departmentId === foundAsset.departmentId) || null)
      if (foundAsset.categoryId) setCategory(cats.find(c => c.categoryId === foundAsset.categoryId) || null)
      if (foundAsset.assignedTo) setAssignedUser(users.find(u => u.uid === foundAsset.assignedTo) || null)
      else setAssignedUser(null)
      
      setLogs(activityLogs)
      setActiveAlloc(alloc)
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadData()
  }, [id, navigate, toast])

  const handleDelete = async () => {
    if (!asset || !confirm('Are you sure you want to delete this asset?')) return
    try {
      await firestoreService.deleteAsset(asset.assetId)
      toast({ variant: 'success', title: 'Deleted', description: 'Asset deleted successfully.' })
      navigate(ROUTES.ASSETS)
    } catch (error: any) {
      toast({ variant: 'error', title: 'Delete Failed', description: error.message })
    }
  }

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!asset || !currentUser || !allocateUser) return
    try {
      await firestoreService.allocateAsset(
        asset.assetId,
        allocateUser,
        expectedReturnDate || null,
        currentUser.uid
      )
      toast({ variant: 'success', title: 'Allocated', description: 'Asset successfully allocated.' })
      setShowAllocate(false)
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Allocation Failed', description: error.message })
    }
  }

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!asset || !currentUser || !activeAlloc) return
    try {
      await firestoreService.returnAsset(
        activeAlloc.allocationId,
        asset.assetId,
        returnNotes,
        currentUser.uid
      )
      toast({ variant: 'success', title: 'Returned', description: 'Asset successfully returned to inventory.' })
      setShowReturn(false)
      setReturnNotes('')
      loadData()
    } catch (error: any) {
      toast({ variant: 'error', title: 'Return Failed', description: error.message })
    }
  }

  const handleRequestTransfer = async () => {
    if (!asset || !currentUser || !assignedUser) return
    try {
      await firestoreService.requestTransfer(
        asset.assetId,
        assignedUser.uid,
        currentUser.uid, // assuming current user wants it, or another UI for choosing target
        currentUser.uid
      )
      toast({ variant: 'success', title: 'Transfer Requested', description: 'Request sent to current holder and admins.' })
    } catch (error: any) {
      toast({ variant: 'error', title: 'Request Failed', description: error.message })
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading asset details...</div>
  }

  if (!asset) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto pb-12"
    >
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.ASSETS}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assets
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0c0c0f] p-6 rounded-xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10">
            <Package className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{asset.assetName}</h2>
            <p className="text-sm text-white/60 font-mono mt-1">{asset.assetTag} • {asset.serialNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button onClick={() => navigate(`/assets/${asset.assetId}/edit`)} variant="outline" className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10 w-full md:w-auto">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button onClick={handleDelete} variant="outline" className="gap-2 border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 w-full md:w-auto">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Info */}
          <div className="bg-[#0c0c0f] rounded-xl border border-white/10 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Asset Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Tag className="h-4 w-4" />
                  <span>Category</span>
                </div>
                <p className="font-medium text-white/90">{category?.name || asset.categoryId}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <CheckCircle className="h-4 w-4" />
                  <span>Status</span>
                </div>
                <p className="font-medium text-white/90">{asset.status}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </div>
                <p className="font-medium text-white/90">{asset.location || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Hash className="h-4 w-4" />
                  <span>Condition</span>
                </div>
                <p className="font-medium text-white/90 capitalize">{asset.condition}</p>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="bg-[#0c0c0f] rounded-xl border border-white/10 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Financial Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Calendar className="h-4 w-4" />
                  <span>Purchase Date</span>
                </div>
                <p className="font-medium text-white/90">{asset.purchaseDate || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <DollarSign className="h-4 w-4" />
                  <span>Acquisition Cost</span>
                </div>
                <p className="font-medium text-white/90">
                  {asset.purchaseCost ? `$${asset.purchaseCost.toFixed(2)}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-[#0c0c0f] rounded-xl border border-white/10 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Activity History
            </h3>
            <div className="space-y-4">
              {logs.length === 0 ? (
                <p className="text-sm text-white/40">No activity recorded for this asset.</p>
              ) : (
                logs.map(log => {
                  const date = log.timestamp ? new Date(log.timestamp.toMillis()).toLocaleString() : 'Unknown Date'
                  return (
                    <div key={log.logId} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="h-2 w-2 mt-2 rounded-full bg-indigo-500/50" />
                      <div>
                        <p className="text-sm font-medium text-white/90">{log.action}</p>
                        <p className="text-xs text-white/40">{date} • By User {log.actorId}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Allocation Board */}
        <div className="space-y-6">
          <div className="bg-[#0c0c0f] rounded-xl border border-white/10 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Allocation & Status</h3>
            
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <UserIcon className="h-4 w-4" />
                  <span>Current Holder</span>
                </div>
                {asset.status === 'Available' ? (
                  <div className="mt-2 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
                    <p className="font-medium text-emerald-400 mb-3">In Inventory (Available)</p>
                    <Button onClick={() => setShowAllocate(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      Allocate Asset
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                    {assignedUser ? (
                      <>
                        <p className="font-medium text-indigo-400">{assignedUser.name}</p>
                        <p className="text-sm text-white/50">{assignedUser.email}</p>
                        {activeAlloc?.expectedReturnDate && (
                          <p className="text-xs text-amber-400 mt-2">Due: {activeAlloc.expectedReturnDate}</p>
                        )}
                        <div className="mt-4 flex flex-col gap-2">
                          <Button onClick={() => setShowReturn(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                            Mark as Returned
                          </Button>
                          <Button onClick={handleRequestTransfer} variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Request Transfer
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="font-medium text-white/90">Status: {asset.status}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allocate Modal */}
      {showAllocate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#0c0c0f] p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">Allocate Asset</h3>
            <form onSubmit={handleAllocate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Assign To *</label>
                <select
                  required
                  value={allocateUser}
                  onChange={e => setAllocateUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Employee</option>
                  {allUsers.map(u => <option key={u.uid} value={u.uid}>{u.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Expected Return Date (Optional)</label>
                <Input
                  type="date"
                  value={expectedReturnDate}
                  onChange={e => setExpectedReturnDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowAllocate(false)} className="text-white">Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirm Allocation</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Return Modal */}
      {showReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#0c0c0f] p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">Return Asset</h3>
            <form onSubmit={handleReturn} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Condition Check-in Notes</label>
                <textarea
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  placeholder="Note any damage, scratches, or missing accessories..."
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowReturn(false)} className="text-white">Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Confirm Return</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
