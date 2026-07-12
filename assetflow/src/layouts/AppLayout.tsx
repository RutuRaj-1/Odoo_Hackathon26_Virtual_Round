import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { STORAGE_KEYS } from '@/constants'

// Map pathname prefixes to readable page titles
const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/organization': 'Organization Setup',
  '/asset-manager/dashboard': 'Dashboard',
  '/department/dashboard': 'Dashboard',
  '/employee/dashboard': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/assets': 'Assets',
  '/employees': 'Employees',
  '/bookings': 'Bookings',
  '/maintenance': 'Maintenance',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

function getPageTitle(pathname: string): string {
  const match = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))
  return match ? match[1] : 'AssetFlow'
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true'
  })
  const { pathname } = useLocation()

  const handleToggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next))
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar pageTitle={getPageTitle(pathname)} />

        {/* Page Content with Framer Motion fade */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex-1 overflow-y-auto p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
