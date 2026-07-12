import { CalendarCheck } from 'lucide-react'
import { PagePlaceholder } from '@/components/common/PagePlaceholder'
import { ROUTES } from '@/constants'

export function BookingsPage() {
  return (
    <PagePlaceholder
      title="Bookings"
      description="Track and manage asset reservation requests."
      icon={CalendarCheck}
      createHref={ROUTES.BOOKING_CREATE}
      createLabel="New Booking"
    />
  )
}
