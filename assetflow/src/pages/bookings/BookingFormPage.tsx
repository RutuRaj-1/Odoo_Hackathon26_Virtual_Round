import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarCheck } from 'lucide-react'
import { ROUTES } from '@/constants'

export function BookingFormPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Link to={ROUTES.BOOKINGS} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Bookings
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CalendarCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">New Booking Request</h2>
          <p className="text-sm text-muted-foreground">Request an asset reservation</p>
        </div>
      </div>
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
        Booking form — coming soon.
      </div>
    </motion.div>
  )
}
