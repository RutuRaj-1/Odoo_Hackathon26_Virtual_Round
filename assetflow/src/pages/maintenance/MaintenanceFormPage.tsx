import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Wrench } from 'lucide-react'
import { ROUTES } from '@/constants'

export function MaintenanceFormPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Link to={ROUTES.MAINTENANCE} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Maintenance
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">New Maintenance Ticket</h2>
          <p className="text-sm text-muted-foreground">Log a new maintenance request or schedule</p>
        </div>
      </div>
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
        Maintenance form — coming soon.
      </div>
    </motion.div>
  )
}
