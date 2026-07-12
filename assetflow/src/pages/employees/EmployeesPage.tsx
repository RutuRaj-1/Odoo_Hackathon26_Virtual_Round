import { Users } from 'lucide-react'
import { PagePlaceholder } from '@/components/common/PagePlaceholder'
import { ROUTES } from '@/constants'

export function EmployeesPage() {
  return (
    <PagePlaceholder
      title="Employees"
      description="Manage your workforce and asset assignments."
      icon={Users}
      createHref={ROUTES.EMPLOYEE_CREATE}
      createLabel="New Employee"
    />
  )
}
