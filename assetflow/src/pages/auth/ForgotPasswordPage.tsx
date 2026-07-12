import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ROUTES } from '@/constants'
import { authService } from '@/services/authService'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await authService.sendPasswordResetEmail(data.email)
      toast({
        variant: 'success',
        title: 'Reset Link Sent',
        description: `We have sent a password reset link to ${data.email}.`,
      })
      reset()
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Error sending link',
        description: err instanceof Error ? err.message : 'Something went wrong.',
      })
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email address and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="reset-email" className="block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="reset-email"
            type="email"
            placeholder="admin@assetflow.com"
            className={`block w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.email ? 'border-red-400 focus:ring-red-400' : 'border-border'
            }`}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          id="reset-submit-btn"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </Button>
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
