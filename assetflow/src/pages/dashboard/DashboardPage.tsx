import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  Package,
  Users,
  CalendarCheck,
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building,
  Bell,
  Activity,
  Check
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { firestoreService } from '@/services/firestoreService'
import { useAuth } from '@/hooks/useAuth'
import type { Asset } from '@/types'

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
}
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
}

export function DashboardPage() {
  const { uid, loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({
    totalAssets: 0,
    availableAssets: 0,
    allocatedAssets: 0,
    totalDepartments: 0,
    totalEmployees: 0,
    openMaintenance: 0,
    unreadNotifications: 0
  })
  
  const [categoryData, setCategoryData] = useState<{name: string, value: number}[]>([])
  const [assetTrendData, setAssetTrendData] = useState<any[]>([])
  const [maintenanceData, setMaintenanceData] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (authLoading || !uid) return

    async function loadDashboardData() {
      try {
        const stats = await firestoreService.getDashboardStats(uid!)
        setCounts(stats.counts)
        setRecentActivity(stats.recentActivity)
        setNotifications(stats.notifications)

        // Process Category Data
        if (stats.allAssets.length > 0) {
          const countsMap: Record<string, number> = {}
          stats.allAssets.forEach((asset: Asset) => {
            const cat = asset.categoryId || 'Uncategorized'
            countsMap[cat] = (countsMap[cat] || 0) + 1
          })
          setCategoryData(Object.keys(countsMap).map(name => ({ name, value: countsMap[name] })))
        }

        // Process Asset Trend (Group by Month)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const trends = Array.from({length: 6}, (_, i) => {
          const d = new Date()
          d.setMonth(d.getMonth() - (5 - i))
          return { month: monthNames[d.getMonth()], active: 0, maintenance: 0, retired: 0, monthNum: d.getMonth() }
        })
        
        stats.allAssets.forEach((asset: Asset) => {
          const created = asset.createdAt ? new Date(asset.createdAt) : new Date()
          const trendItem = trends.find(t => t.monthNum === created.getMonth())
          if (trendItem) {
            if (asset.status === 'Available' || asset.status === 'Allocated') trendItem.active++
            else if (asset.status === 'Under Maintenance') trendItem.maintenance++
            else if (asset.status === 'Retired' || asset.status === 'Disposed') trendItem.retired++
          }
        })
        setAssetTrendData(trends)

        // Process Maintenance Data (Group by status across weeks)
        // Simple mock week buckets for demonstration based on real counts
        const scheduled = stats.allMaintenance.filter((m: any) => m.status === 'pending' || m.status === 'approved').length
        const completed = stats.allMaintenance.filter((m: any) => m.status === 'resolved').length
        const inProgress = stats.allMaintenance.filter((m: any) => m.status === 'in_progress').length
        
        setMaintenanceData([
          { week: 'W1', pending: Math.ceil(scheduled * 0.2), resolved: Math.ceil(completed * 0.2), inProgress: Math.ceil(inProgress * 0.2) },
          { week: 'W2', pending: Math.ceil(scheduled * 0.3), resolved: Math.ceil(completed * 0.2), inProgress: Math.ceil(inProgress * 0.3) },
          { week: 'W3', pending: Math.ceil(scheduled * 0.2), resolved: Math.ceil(completed * 0.3), inProgress: Math.ceil(inProgress * 0.2) },
          { week: 'W4', pending: Math.ceil(scheduled * 0.3), resolved: Math.ceil(completed * 0.3), inProgress: Math.ceil(inProgress * 0.3) }
        ])

      } catch (err) {
        console.error('Error fetching dashboard counts:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [uid, authLoading])

  const statsCards = [
    {
      id: 'total-assets',
      label: 'Total Assets',
      value: loading ? '...' : counts.totalAssets.toLocaleString(),
      change: '+0%',
      trend: 'up',
      icon: Package,
      color: 'bg-indigo-500/10 text-indigo-500'
    },
    {
      id: 'available-assets',
      label: 'Available Assets',
      value: loading ? '...' : counts.availableAssets.toLocaleString(),
      change: 'Active',
      trend: 'up',
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 text-emerald-500'
    },
    {
      id: 'allocated-assets',
      label: 'Allocated Assets',
      value: loading ? '...' : counts.allocatedAssets.toLocaleString(),
      change: 'Active',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      id: 'open-maintenance',
      label: 'Maintenance',
      value: loading ? '...' : counts.openMaintenance.toLocaleString(),
      change: 'Needs Attention',
      trend: 'down',
      icon: Wrench,
      color: 'bg-orange-500/10 text-orange-500'
    },
    {
      id: 'total-departments',
      label: 'Departments',
      value: loading ? '...' : counts.totalDepartments.toLocaleString(),
      change: 'Active',
      trend: 'up',
      icon: Building,
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      id: 'total-employees',
      label: 'Employees',
      value: loading ? '...' : counts.totalEmployees.toLocaleString(),
      change: 'Active',
      trend: 'up',
      icon: Users,
      color: 'bg-pink-500/10 text-pink-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-sm text-white/60">
          Welcome back — here's what's happening with your assets today.
        </p>
      </div>

      {/* Stats Cards Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.id}
              variants={cardVariants}
              className="rounded-xl border border-white/10 bg-[#0c0c0f] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">{card.label}</p>
                  <p className="mt-1.5 text-3xl font-bold text-white">{card.value}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    <TrendingUp
                      className={`h-3 w-3 ${card.trend === 'up' ? 'text-emerald-500' : 'rotate-180 text-orange-500'}`}
                    />
                    <span className={card.trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}>
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className={`rounded-lg p-2.5 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Asset Trend */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="col-span-2 rounded-xl border border-white/10 bg-[#0c0c0f] p-5 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-white">Asset Status Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            {loading ? (
               <div className="h-full flex items-center justify-center text-white/40">Loading Chart...</div>
            ) : (
              <AreaChart data={assetTrendData}>
                <defs>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip
                  contentStyle={{ background: '#0c0c0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="active" stroke="#6366f1" fill="url(#activeGrad)" strokeWidth={2} name="Active" />
                <Area type="monotone" dataKey="maintenance" stroke="#f59e0b" fill="transparent" strokeWidth={2} strokeDasharray="4 2" name="Maintenance" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="rounded-xl border border-white/10 bg-[#0c0c0f] p-5 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-white">Assets by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
             {loading ? (
               <div className="h-full flex items-center justify-center text-white/40">Loading Chart...</div>
            ) : categoryData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-white/40">No Asset Data</div>
            ) : (
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0c0c0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 + Recent Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Maintenance Bar Chart */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="col-span-2 rounded-xl border border-white/10 bg-[#0c0c0f] p-5 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-white">Maintenance Volume</h3>
          <ResponsiveContainer width="100%" height={200}>
            {loading ? (
              <div className="h-full flex items-center justify-center text-white/40">Loading Chart...</div>
            ) : (
              <BarChart data={maintenanceData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip
                  contentStyle={{ background: '#0c0c0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="pending" fill="#6366f1" radius={[4, 4, 0, 0]} name="Pending" />
                <Bar dataKey="inProgress" fill="#f59e0b" radius={[4, 4, 0, 0]} name="In Progress" />
                <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Right Column: Activity & Notifications */}
        <div className="flex flex-col gap-4">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="rounded-xl border border-white/10 bg-[#0c0c0f] p-5 shadow-sm flex-1"
          >
            <h3 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              Recent Activity
            </h3>
            <ul className="space-y-4">
              {loading ? (
                <li className="text-xs text-white/40">Loading activity...</li>
              ) : recentActivity.length === 0 ? (
                <li className="text-xs text-white/40">No recent activity.</li>
              ) : recentActivity.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-white/90">{item.action}</p>
                    <p className="mt-0.5 text-[10px] text-white/40">
                      {item.timestamp ? new Date(item.timestamp.toMillis()).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="rounded-xl border border-white/10 bg-[#0c0c0f] p-5 shadow-sm flex-1"
          >
            <h3 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-400" />
              Unread Notifications
            </h3>
            <ul className="space-y-4">
              {loading ? (
                <li className="text-xs text-white/40">Loading notifications...</li>
              ) : notifications.length === 0 ? (
                <li className="text-xs text-white/40">You're all caught up!</li>
              ) : notifications.map((notif) => (
                <li key={notif.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-orange-500/50 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/90">{notif.title}</p>
                    <p className="text-[10px] text-white/60">{notif.message}</p>
                    <p className="mt-0.5 text-[10px] text-white/40">
                      {notif.timestamp ? new Date(notif.timestamp.toMillis()).toLocaleString() : 'Recent'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
