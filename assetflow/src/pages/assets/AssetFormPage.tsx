import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package } from 'lucide-react'
import { ROUTES } from '@/constants'

export function AssetFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.ASSETS}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assets
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isEdit ? 'Edit Asset' : 'New Asset'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEdit ? `Editing asset ${id}` : 'Fill in the details to register a new asset'}
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
        Asset form (React Hook Form + Zod) — coming soon.
      </div>
    </motion.div>
  )
}
