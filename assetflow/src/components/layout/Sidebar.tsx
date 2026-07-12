import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Users,
  CalendarCheck,
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Building,
} from 'lucide-react'
import { cn } from '@/utils'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { isAdmin, isAssetManager, isDepartmentHead, isEmployee } from '@/routes/guards'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { pathname } = useLocation()
  const { role } = useAuth()

  // Get specific dashboard path
  let dashboardPath: string = ROUTES.DASHBOARD
  if (isAdmin(role)) dashboardPath = '/admin/dashboard'
  else if (isAssetManager(role)) dashboardPath = '/asset-manager/dashboard'
  else if (isDepartmentHead(role)) dashboardPath = '/department/dashboard'
  else if (isEmployee(role)) dashboardPath = '/employee/dashboard'

  // Dynamic Navigation Items
  const navItems = [
    {
      label: 'Dashboard',
      href: dashboardPath,
      icon: LayoutDashboard,
    },
    {
      label: 'Assets',
      href: ROUTES.ASSETS,
      icon: Package,
    },
    {
      label: 'Employees',
      href: ROUTES.EMPLOYEES,
      icon: Users,
    },
    {
      label: 'Bookings',
      href: ROUTES.BOOKINGS,
      icon: CalendarCheck,
    },
    {
      label: 'Maintenance',
      href: ROUTES.MAINTENANCE,
      icon: Wrench,
    },
  ]

  // Inject Organization Setup for Admins
  if (isAdmin(role)) {
    navItems.push({
      label: 'Organization',
      href: '/admin/organization',
      icon: Building,
    })
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex h-full flex-col border-r border-border bg-card"
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="logo-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap text-lg font-bold text-foreground"
              >
                AssetFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        key={`nav-${item.label}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-2">
        <Link
          to={ROUTES.SETTINGS}
          title={collapsed ? 'Settings' : undefined}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="h-5 w-5 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="settings-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </motion.aside>
  )
}
