import { Package } from 'lucide-react'
import { PagePlaceholder } from '@/components/common/PagePlaceholder'
import { ROUTES } from '@/constants'

export function AssetsPage() {
  return (
    <PagePlaceholder
      title="Assets"
      description="Manage your organization's physical and digital assets."
      icon={Package}
      createHref={ROUTES.ASSET_CREATE}
      createLabel="New Asset"
    />
  )
}
