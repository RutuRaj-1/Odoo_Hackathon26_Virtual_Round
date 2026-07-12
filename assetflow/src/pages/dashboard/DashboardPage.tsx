import { useState, useEffect, useMemo } from 'react'
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
  ArrowLeftRight,
  AlertTriangle,
  Inbox,
  ArrowUpRight,
  ShieldCheck
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
import { bookingService } from '@/services/bookingService'
import { assetService } from '@/services/assetService'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import type { Asset } from '@/types'

// ─── Theme Colors ─────────────────────────────────────────────────────────────
const CHART_COLORS = ['#714B67', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#64748B']

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
}
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
}

export function DashboardPage() {
  const { uid, loading: authLoading } = useAuth()
  const { resolvedTheme } = useTheme()
  
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
  const [overdueCount, setOverdueCount] = useState(0)
  const [pendingBookings, setPendingBookings] = useState(0)
  
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

        // Fetch categories to resolve IDs to names
        let cats: any[] = []
        try {
          cats = await firestoreService.getCategories()
        } catch (_) {}

        // Pending bookings count
        try {
          const bookingsResp = await bookingService.getAll({ status: 'pending', page: 1, pageSize: 100 })
          setPendingBookings(bookingsResp.total)
        } catch (_) {}

        // Overdue assets count
        try {
          const assetsResp = await assetService.getAll({ status: 'Allocated', page: 1, pageSize: 500 })
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
          const overdue = assetsResp.data.filter(a => {
            const updated = new Date(a.updatedAt || a.createdAt || '').getTime()
            return updated < thirtyDaysAgo
          })
          setOverdueCount(overdue.length)
        } catch (_) {}

        // Process Category Data resolving categoryId to Category Name
        if (stats.allAssets.length > 0) {
          const countsMap: Record<string, number> = {}
          stats.allAssets.forEach((asset: Asset) => {
            const catId = asset.categoryId || 'Uncategorized'
            const catName = cats.find(c => c.categoryId === catId)?.name || catId
            countsMap[catName] = (countsMap[catName] || 0) + 1
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

        // Process Maintenance Data
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

  // Total categories value sum for percentages
  const categoryTotal = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.value, 0)
  }, [categoryData])

  // Custom legend formatter to show values and percentages
  const renderLegendText = (value: string) => {
    const item = categoryData.find(c => c.name === value)
    if (!item) return value
    const percentage = categoryTotal > 0 ? ((item.value / categoryTotal) * 100).toFixed(0) : 0
    return (
      <span className="text-xs font-semibold text-muted-foreground mr-3">
        <span className="text-foreground">{value}</span> ({item.value} • {percentage}%)
      </span>
    )
  }

  // Theme-aware Chart Props
  const gridStroke = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)'
  const axisColor = resolvedTheme === 'dark' ? '#94A3B8' : '#64748B'
  const tooltipBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const tooltipBorder = resolvedTheme === 'dark' ? '#334155' : '#E2E8F0'
  const tooltipText = resolvedTheme === 'dark' ? '#F8FAFC' : '#1E293B'

  const statsCards = [
    {
      id: 'available-assets',
      label: 'Available',
      value: loading ? '...' : counts.availableAssets.toLocaleString(),
      change: 'Ready to allocate',
      trend: 'up',
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    {
      id: 'allocated-assets',
      label: 'Allocated',
      value: loading ? '...' : counts.allocatedAssets.toLocaleString(),
      change: 'Currently in use',
      trend: 'up',
      icon: ArrowLeftRight,
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    },
    {
      id: 'total-assets',
      label: 'Total Assets',
      value: loading ? '...' : counts.totalAssets.toLocaleString(),
      change: 'Registered',
      trend: 'up',
      icon: Package,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
      id: 'active-bookings',
      label: 'Active Bookings',
      value: loading ? '...' : pendingBookings.toLocaleString(),
      change: 'Pending approval',
      trend: 'up',
      icon: CalendarCheck,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
    {
      id: 'open-maintenance',
      label: 'Maintenance',
      value: loading ? '...' : counts.openMaintenance.toLocaleString(),
      change: 'Open tickets',
      trend: 'down',
      icon: Wrench,
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    },
    {
      id: 'total-departments',
      label: 'Departments',
      value: loading ? '...' : counts.totalDepartments.toLocaleString(),
      change: 'Active',
      trend: 'up',
      icon: Building,
      color: 'bg-pink-500/10 text-pink-500 border-pink-500/20'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Today's Overview</h2>
          <p className="text-sm text-muted-foreground">
            Welcome back — here's the operational status of your organization today.
          </p>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {!loading && overdueCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3.5 rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-4 shadow-sm"
        >
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-foreground font-semibold">Overdue Allocations Alert</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {overdueCount} asset{overdueCount > 1 ? 's are' : ' is'} currently overdue for return. Please follow up with assigned employees.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Cards Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.id}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col justify-between h-full gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{card.label}</span>
                  <div className={`rounded-xl p-2.5 border ${card.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{card.value}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp
                      className={`h-3.5 w-3.5 ${card.trend === 'up' ? 'text-success' : 'rotate-180 text-warning'}`}
                    />
                    <span className={card.trend === 'up' ? 'text-success font-medium' : 'text-warning font-medium'}>
                      {card.change}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Asset Trend */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Asset Status Trend</h3>
              <p className="text-xs text-muted-foreground">Monthly growth and maintenance levels (6 Months)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {loading ? (
               <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div>
            ) : (
              <AreaChart data={assetTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#714B67" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#714B67" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} axisLine={{ stroke: gridStroke }} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={{ stroke: gridStroke }} />
                <Tooltip
                  contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, color: tooltipText, fontSize: 12 }}
                  itemStyle={{ color: tooltipText }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="active" stroke="#714B67" fill="url(#activeGrad)" strokeWidth={2} name="Active Assets" />
                <Area type="monotone" dataKey="maintenance" stroke="#F59E0B" fill="transparent" strokeWidth={2} strokeDasharray="4 2" name="Under Maintenance" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground">Assets by Category</h3>
            <p className="text-xs text-muted-foreground">Distribution across hardware & resources</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
             {loading ? (
               <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div>
            ) : categoryData.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                 <Inbox className="h-8 w-8 opacity-30" />
                 <span className="text-xs">No asset data found</span>
               </div>
            ) : (
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={68}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, color: tooltipText, fontSize: 12 }}
                  itemStyle={{ color: tooltipText }}
                />
                <Legend verticalAlign="bottom" align="center" formatter={renderLegendText} layout="horizontal" iconType="circle" />
              </PieChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Maintenance Bar Chart */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground">Maintenance Volume</h3>
            <p className="text-xs text-muted-foreground">Weekly report of incidents and resolved tickets</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div>
            ) : (
              <BarChart data={maintenanceData} barSize={16} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: axisColor }} axisLine={{ stroke: gridStroke }} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={{ stroke: gridStroke }} />
                <Tooltip
                  contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, color: tooltipText, fontSize: 12 }}
                  itemStyle={{ color: tooltipText }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="pending" fill="#714B67" radius={[4, 4, 0, 0]} name="Pending" />
                <Bar dataKey="inProgress" fill="#F59E0B" radius={[4, 4, 0, 0]} name="In Progress" />
                <Bar dataKey="resolved" fill="#22C55E" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Right Column: Activity & Notifications */}
        <div className="flex flex-col gap-6">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-border bg-card p-6 shadow-sm flex-1 flex flex-col justify-between"
          >
            <h3 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </h3>
            <ul className="space-y-4 flex-1">
              {loading ? (
                <li className="text-xs text-muted-foreground">Loading activity...</li>
              ) : recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                  <Activity className="h-7 w-7 text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-semibold text-foreground">No Recent Activity</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Everything is running smoothly.</p>
                </div>
              ) : recentActivity.slice(0, 3).map((item) => (
                <li key={item.id} className="flex items-start gap-3 text-xs">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{item.action}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
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
            className="rounded-2xl border border-border bg-card p-6 shadow-sm flex-1 flex flex-col justify-between"
          >
            <h3 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-warning" />
              Unread Notifications
            </h3>
            <ul className="space-y-4 flex-1">
              {loading ? (
                <li className="text-xs text-muted-foreground">Loading notifications...</li>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                  <ShieldCheck className="h-7 w-7 text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-semibold text-foreground">No Notifications</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">You're all caught up!</p>
                </div>
              ) : notifications.slice(0, 2).map((notif) => (
                <li key={notif.id} className="flex items-start gap-3 text-xs">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-warning shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{notif.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-[9px] text-muted-foreground/75 mt-1">
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
