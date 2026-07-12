import { Wrench } from 'lucide-react'
import { PagePlaceholder } from '@/components/common/PagePlaceholder'
import { ROUTES } from '@/constants'

export function MaintenancePage() {
  return (
    <PagePlaceholder
      title="Maintenance"
      description="Schedule and track asset maintenance records."
      icon={Wrench}
      createHref={ROUTES.MAINTENANCE_CREATE}
      createLabel="New Ticket"
    />
  )
}
