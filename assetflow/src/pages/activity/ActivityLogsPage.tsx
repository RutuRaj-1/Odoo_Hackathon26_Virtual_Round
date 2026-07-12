import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { ActivityLog, User } from '@/types'
import { ClipboardList, CheckCircle2, XCircle } from 'lucide-react'

export function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [usersMap, setUsersMap] = useState<Record<string, User>>({})
  const [loading, setLoading] = useState(true)

  // Fetch users mapping once
  useEffect(() => {
    async function fetchUsers() {
      const snap = await getDocs(collection(db, 'users'))
      const map: Record<string, User> = {}
      snap.docs.forEach(d => {
        map[d.id] = d.data() as User
      })
      setUsersMap(map)
    }
    fetchUsers()
  }, [])

  // Subscribe to logs
  useEffect(() => {
    const q = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsedLogs = snapshot.docs.map(doc => ({
        logId: doc.id,
        ...doc.data()
      })) as ActivityLog[]
      setLogs(parsedLogs)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching activity logs:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
          <ClipboardList className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Activity Logs</h2>
          <p className="text-sm text-white/60">
            A complete audit trail of system events across all roles.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0c0c0f] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center text-sm text-white/50">Fetching logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-sm text-white/40">No activity logs found.</div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-white/80">
              <thead className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Activity</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => {
                  const author = usersMap[log.actorId]
                  const authorName = author ? author.name : log.actorId
                  
                  return (
                    <tr key={log.logId} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-white/60">
                          {log.timestamp ? new Date(log.timestamp.toMillis()).toLocaleString() : 'Pending...'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white">{log.action}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/60">{log.description || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/80">{authorName}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {log.status === 'success' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Success
                          </span>
                        ) : log.status === 'failed' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border bg-rose-500/10 text-rose-400 border-rose-500/20">
                            <XCircle className="h-3.5 w-3.5" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border bg-white/5 text-white/50 border-white/10">
                            Logged
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  )
}
