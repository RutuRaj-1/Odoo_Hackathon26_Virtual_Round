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
  CheckCircle2
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
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/firebase'

// ─── Static / Default Mock Fallbacks (for premium visuals on empty database) ────
const defaultAssetTrendData = [
  { month: 'Jan', active: 10, maintenance: 1, retired: 0 },
  { month: 'Feb', active: 15, maintenance: 2, retired: 0 },
  { month: 'Mar', active: 18, maintenance: 1, retired: 1 },
  { month: 'Apr', active: 22, maintenance: 3, retired: 1 },
  { month: 'May', active: 31, maintenance: 2, retired: 2 },
  { month: 'Jun', active: 45, maintenance: 4, retired: 2 }
]

const defaultCategoryData = [
  { name: 'Hardware', value: 5 },
  { name: 'Software', value: 3 },
  { name: 'Furniture', value: 2 },
  { name: 'Vehicles', value: 1 },
  { name: 'Equipment', value: 2 }
]

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

const defaultMaintenanceData = [
  { week: 'W1', scheduled: 2, completed: 1, overdue: 1 },
  { week: 'W2', scheduled: 4, completed: 3, overdue: 0 },
  { week: 'W3', scheduled: 3, completed: 3, overdue: 0 },
  { week: 'W4', scheduled: 5, completed: 4, overdue: 1 }
]

const defaultRecentActivity = [
  { id: 1, text: 'Asset Database initialized successfully', time: '1h ago', status: 'approved', icon: CheckCircle2 },
  { id: 2, text: 'Admin promoted Employee to Manager', time: '2h ago', status: 'approved', icon: CheckCircle2 },
  { id: 3, text: 'Scheduled system performance check', time: '4h ago', status: 'scheduled', icon: Clock }
]

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
}
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
}

export function DashboardPage() {
  const [counts, setCounts] = useState({
    totalAssets: 0,
    activeEmployees: 0,
    pendingBookings: 0,
    openMaintenance: 0
  })
  const [categoryData, setCategoryData] = useState(defaultCategoryData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [assetsSnap, usersSnap, bookingsSnap, maintenanceSnap] = await Promise.all([
          getDocs(collection(db, 'assets')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'bookings')),
          getDocs(collection(db, 'maintenanceRequests'))
        ])

        const assetsCount = assetsSnap.size
        const employeesCount = usersSnap.docs.filter((d) => {
          const u = d.data()
          return u.role !== 'Admin' && u.status !== 'Inactive'
        }).length
        const bookingsCount = bookingsSnap.docs.filter((d) => {
          const b = d.data()
          return b.status === 'pending' || b.status === 'Pending'
        }).length
        const maintenanceCount = maintenanceSnap.docs.filter((d) => {
          const m = d.data()
          return m.status !== 'completed' && m.status !== 'Completed'
        }).length

        setCounts({
          totalAssets: assetsCount,
          activeEmployees: employeesCount,
          pendingBookings: bookingsCount,
          openMaintenance: maintenanceCount
        })

        // Compute real category breakdown from assets if there is data
        if (assetsCount > 0) {
          const countsMap: Record<string, number> = {}
          assetsSnap.docs.forEach((doc) => {
            const cat = doc.data().category || 'other'
            const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1)
            countsMap[formattedCat] = (countsMap[formattedCat] || 0) + 1
          })
          const computedCategories = Object.keys(countsMap).map((name) => ({
            name,
            value: countsMap[name]
          }))
          setCategoryData(computedCategories)
        }
      } catch (err) {
        console.error('Error fetching dashboard counts:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  const statsCards = [
    {
      id: 'total-assets',
      label: 'Total Assets',
      value: loading ? '...' : counts.totalAssets.toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: Package,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      id: 'active-employees',
      label: 'Active Employees',
      value: loading ? '...' : counts.activeEmployees.toLocaleString(),
      change: '+3%',
      trend: 'up',
      icon: Users,
      color: 'bg-green-500/10 text-green-500'
    },
    {
      id: 'pending-bookings',
      label: 'Pending Bookings',
      value: loading ? '...' : counts.pendingBookings.toLocaleString(),
      change: '-5%',
      trend: 'down',
      icon: CalendarCheck,
      color: 'bg-yellow-500/10 text-yellow-500'
    },
    {
      id: 'open-maintenance',
      label: 'Open Maintenance',
      value: loading ? '...' : counts.openMaintenance.toLocaleString(),
      change: '+2',
      trend: 'up',
      icon: Wrench,
      color: 'bg-red-500/10 text-red-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Welcome back — here's what's happening with your assets today.
        </p>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.id}
              variants={cardVariants}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-1.5 text-3xl font-bold text-foreground">{card.value}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    <TrendingUp
                      className={`h-3 w-3 ${card.trend === 'up' ? 'text-green-500' : 'rotate-180 text-red-500'}`}
                    />
                    <span className={card.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {card.change}
                    </span>
                    <span className="text-muted-foreground">vs last month</span>
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
          className="col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-foreground">Asset Status Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={defaultAssetTrendData}>
              <defs>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
              />
              <Legend />
              <Area type="monotone" dataKey="active" stroke="#6366f1" fill="url(#activeGrad)" strokeWidth={2} name="Active" />
              <Area type="monotone" dataKey="maintenance" stroke="#f59e0b" fill="transparent" strokeWidth={2} strokeDasharray="4 2" name="Maintenance" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-foreground">Assets by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
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
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
              />
              <Legend />
            </PieChart>
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
          className="col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-foreground">Maintenance This Month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={defaultMaintenanceData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
              />
              <Legend />
              <Bar dataKey="scheduled" fill="#6366f1" radius={[4, 4, 0, 0]} name="Scheduled" />
              <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completed" />
              <Bar dataKey="overdue" fill="#ef4444" radius={[4, 4, 0, 0]} name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <h3 className="mb-4 text-sm font-semibold text-foreground">Recent Activity</h3>
          <ul className="space-y-3">
            {defaultRecentActivity.map((item) => {
              const Icon = item.icon
              const iconColor =
                item.status === 'approved' || item.status === 'completed'
                  ? 'text-green-500'
                  : item.status === 'warning'
                  ? 'text-yellow-500'
                  : 'text-blue-500'
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-foreground">{item.text}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
