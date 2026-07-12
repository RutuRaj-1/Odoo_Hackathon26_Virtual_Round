import React, { createContext, useCallback, useContext, useReducer } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/utils'
import { generateId } from '@/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number
}

type Action =
  | { type: 'ADD'; toast: Toast }
  | { type: 'REMOVE'; id: string }

// ─── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state: Toast[], action: Action): Toast[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast]
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id)
    default:
      return state
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────
interface ToastContextValue {
  toasts: Toast[]
  toast: (opts: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// ─── Icons ─────────────────────────────────────────────────────────────────────
const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />,
  error: <XCircle className="h-4 w-4 text-red-400 shrink-0" />,
  info: <Info className="h-4 w-4 text-blue-400 shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />,
}

const STYLES: Record<ToastVariant, string> = {
  success: 'border-emerald-500/20 bg-emerald-950/80',
  error: 'border-red-500/20 bg-red-950/80',
  info: 'border-blue-500/20 bg-blue-950/80',
  warning: 'border-yellow-500/20 bg-yellow-950/80',
}

// ─── Toast Item ────────────────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [toast.duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 rounded-xl border backdrop-blur-md px-4 py-3 shadow-2xl w-80 max-w-[calc(100vw-2rem)]',
        STYLES[toast.variant],
      )}
      role="alert"
    >
      {ICONS[toast.variant]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-white/60">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-white/30 hover:text-white/70 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}

// ─── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, [])

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    dispatch({ type: 'ADD', toast: { id: generateId(), ...opts } })
  }, [])

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id })
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {/* Toast Container */}
      <div
        aria-live="polite"
        className="fixed right-4 top-4 z-[9999] flex flex-col gap-2"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
