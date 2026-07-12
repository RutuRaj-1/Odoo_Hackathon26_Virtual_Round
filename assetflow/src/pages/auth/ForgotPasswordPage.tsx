import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

export function ForgotPasswordPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email address and we'll send you a reset link.
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="reset-email" className="block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="reset-email"
            type="email"
            placeholder="admin@assetflow.com"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          id="reset-submit-btn"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
