import { useState } from 'react'
import { Bell, Moon, Sun, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { getInitials } from '@/utils'
import { GlobalSearch } from '@/components/common/GlobalSearch'
import { NotificationDrawer, type AppNotification } from '@/components/layout/NotificationDrawer'

interface TopbarProps {
  pageTitle?: string
}

export function Topbar({ pageTitle }: TopbarProps) {
  const { currentUser: user, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  
  // Notification States
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: '1',
      title: 'Asset Registered Successfully',
      message: 'New Dell Monitor #AF-0012 has been registered under IT Department.',
      type: 'success',
      timestamp: '5 mins ago',
      isRead: false
    },
    {
      id: '2',
      title: 'Warranty Expiry Warning',
      message: 'MacBook Pro #AF-2041 warranty is expiring in 15 days.',
      type: 'warning',
      timestamp: '2 hours ago',
      isRead: false
    },
    {
      id: '3',
      title: 'Maintenance Incident Overdue',
      message: 'Server Rack #MT-0012 repair ticket has exceeded target resolution time.',
      type: 'error',
      timestamp: '1 day ago',
      isRead: true
    },
    {
      id: '4',
      title: 'Booking Approved',
      message: 'Your booking request BK-0248 for Conference Room A has been approved.',
      type: 'info',
      timestamp: '2 days ago',
      isRead: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-6">
      {/* Page Title */}
      {pageTitle && (
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Global Search */}
      <div className="hidden sm:block">
        <GlobalSearch />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Notifications Bell */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {unreadCount}
          </span>
        )}
      </button>

      {/* User Avatar + Logout */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {user ? getInitials(user.name) : 'U'}
        </div>
        <div className="hidden flex-col sm:flex">
          <span className="text-sm font-medium text-foreground leading-none">{user?.name}</span>
          <span className="mt-0.5 text-xs text-muted-foreground capitalize">{user?.role}</span>
        </div>
        <button
          onClick={logout}
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Notification Drawer Overlay */}
      <NotificationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAll}
      />
    </header>
  )
}
