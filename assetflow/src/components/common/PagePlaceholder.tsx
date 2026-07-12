import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, type LucideIcon } from 'lucide-react'

interface PagePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  createHref?: string
  createLabel?: string
}

/**
 * Generic placeholder used by non-dashboard pages.
 * Swap out for real content as each module is built.
 */
export function PagePlaceholder({
  title,
  description,
  icon: Icon,
  createHref,
  createLabel,
}: PagePlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {createHref && (
          <Link
            to={createHref}
            id={`${title.toLowerCase().replace(/\s+/g, '-')}-create-btn`}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {createLabel ?? `New ${title.slice(0, -1)}`}
          </Link>
        )}
      </div>

      {/* Empty state */}
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          This module is under construction. Content will appear here once connected to the backend.
        </p>
        {createHref && (
          <Link
            to={createHref}
            className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {createLabel ?? `New ${title}`}
          </Link>
        )}
      </div>
    </motion.div>
  )
}
