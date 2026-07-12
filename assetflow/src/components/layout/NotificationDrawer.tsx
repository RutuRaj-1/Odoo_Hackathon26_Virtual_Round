import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Activity,
  Trash2,
  MailOpen,
  BellRing
} from 'lucide-react'
import { cn } from '@/utils'

export type NotificationType = 'success' | 'warning' | 'error' | 'info' | 'activity'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: string
  isRead: boolean
}

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
  notifications: AppNotification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onClearAll: () => void
}

export function NotificationDrawer({
  open,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll
}: NotificationDrawerProps) {

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-rose-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'activity':
        return <Activity className="h-4 w-4 text-purple-500" />
    }
  }

  const getTypeStyle = (type: NotificationType, isRead: boolean) => {
    if (isRead) return 'opacity-65 border-border bg-card'
    switch (type) {
      case 'success': return 'border-emerald-500/20 bg-emerald-500/5'
      case 'warning': return 'border-amber-500/20 bg-amber-500/5'
      case 'error': return 'border-rose-500/20 bg-rose-500/5'
      case 'info': return 'border-blue-500/20 bg-blue-500/5'
      case 'activity': return 'border-purple-500/20 bg-purple-500/5'
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-border bg-card shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Notifications</h3>
                {notifications.some(n => !n.isRead) && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {notifications.filter(n => !n.isRead).length} New
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Notification Actions Toolbar */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-6 py-2.5 text-xs">
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  <MailOpen className="h-3.5 w-3.5" /> Mark all read
                </button>
                <button
                  onClick={onClearAll}
                  className="flex items-center gap-1 text-muted-foreground hover:text-rose-500 transition-colors font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear all
                </button>
              </div>
            )}

            {/* Drawer Body Scroll Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-8 text-muted-foreground">
                  <div className="rounded-full bg-muted/60 p-4 mb-4">
                    <BellRing className="h-8 w-8 opacity-40 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">No notifications yet</h4>
                  <p className="text-xs mt-1 max-w-xs">We'll alert you here when assets status changes or requests require your attention.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && onMarkRead(n.id)}
                    className={cn(
                      "relative rounded-xl border p-4 shadow-sm transition-all duration-200 cursor-pointer flex gap-3.5 group",
                      getTypeStyle(n.type, n.isRead)
                    )}
                  >
                    {/* Read indicator dot */}
                    {!n.isRead && (
                      <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                    )}
                    
                    {/* Icon */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border shadow-sm">
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={cn("text-xs font-bold text-foreground truncate pr-4", !n.isRead && "text-primary")}>
                        {n.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/70 block mt-2">
                        {n.timestamp}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
