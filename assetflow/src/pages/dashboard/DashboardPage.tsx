import { motion } from 'framer-motion'
import {
  Package,
  Users,
  CalendarCheck,
  Wrench,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
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
  Legend,
} from 'recharts'

// ─── Mock data (replace with API calls) ───────────────────────────────────────
const statsCards = [
  {
    id: 'total-assets',
    label: 'Total Assets',
    value: '2,847',
    change: '+12%',
    trend: 'up',
    icon: Package,
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    id: 'active-employees',
    label: 'Active Employees',
    value: '543',
    change: '+3%',
    trend: 'up',
    icon: Users,
    color: 'bg-green-500/10 text-green-500',
  },
  {
    id: 'pending-bookings',
    label: 'Pending Bookings',
    value: '28',
    change: '-5%',
    trend: 'down',
    icon: CalendarCheck,
    color: 'bg-yellow-500/10 text-yellow-500',
  },
  {
    id: 'open-maintenance',
    label: 'Open Maintenance',
    value: '14',
    change: '+2',
    trend: 'up',
    icon: Wrench,
    color: 'bg-red-500/10 text-red-500',
  },
]

const assetTrendData = [
  { month: 'Jan', active: 2400, maintenance: 120, retired: 40 },
  { month: 'Feb', active: 2500, maintenance: 100, retired: 45 },
  { month: 'Mar', active: 2600, maintenance: 140, retired: 50 },
  { month: 'Apr', active: 2550, maintenance: 160, retired: 55 },
  { month: 'May', active: 2700, maintenance: 130, retired: 60 },
  { month: 'Jun', active: 2847, maintenance: 110, retired: 65 },
]

const categoryData = [
  { name: 'Hardware', value: 1240 },
  { name: 'Software', value: 680 },
  { name: 'Furniture', value: 420 },
  { name: 'Vehicles', value: 320 },
  { name: 'Equipment', value: 187 },
]

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

const maintenanceData = [
  { week: 'W1', scheduled: 12, completed: 10, overdue: 2 },
  { week: 'W2', scheduled: 15, completed: 14, overdue: 1 },
  { week: 'W3', scheduled: 10, completed: 8, overdue: 2 },
  { week: 'W4', scheduled: 18, completed: 16, overdue: 3 },
]

const recentActivity = [
  { id: 1, type: 'booking', text: 'MacBook Pro #A-2041 booked by Sarah K.', time: '2m ago', status: 'approved', icon: CheckCircle },
  { id: 2, type: 'maintenance', text: 'Server Rack #S-0012 scheduled for inspection', time: '15m ago', status: 'scheduled', icon: Clock },
  { id: 3, type: 'alert', text: 'Asset #V-0089 warranty expiring in 7 days', time: '1h ago', status: 'warning', icon: AlertTriangle },
  { id: 4, type: 'booking', text: 'Conference Room A booking approved', time: '2h ago', status: 'approved', icon: CheckCircle },
  { id: 5, type: 'maintenance', text: 'Dell Monitor #M-0231 repair completed', time: '3h ago', status: 'completed', icon: CheckCircle },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function DashboardPage() {
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
                    <span
                      className={card.trend === 'up' ? 'text-green-500' : 'text-red-500'}
                    >
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
            <AreaChart data={assetTrendData}>
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
            <BarChart data={maintenanceData} barSize={20}>
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
            {recentActivity.map((item) => {
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
