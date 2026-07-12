import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0c] px-6 text-center text-white">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-red-500/25 bg-red-950/20 shadow-lg shadow-red-950/50">
        <ShieldAlert className="h-10 w-10 text-red-400" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-white/95 sm:text-4xl">
        Access Denied
      </h1>
      
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
        You do not have the required role or permissions to access this module. Please contact your administrator if you believe this is an error.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" asChild variant="default">
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
