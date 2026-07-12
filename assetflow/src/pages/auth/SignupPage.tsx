import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import { ROUTES } from '@/constants'

// ─── Validation schema ─────────────────────────────────────────────────────────
const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name is too long')
      .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type SignupForm = z.infer<typeof signupSchema>

// ─── Password strength indicator ───────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length

  const bar =
    score === 0 ? 'w-0'
    : score === 1 ? 'w-1/3 bg-red-500'
    : score === 2 ? 'w-2/3 bg-yellow-500'
    : 'w-full bg-emerald-500'

  if (!password) return null

  return (
    <div className="mt-1.5 space-y-2">
      {/* Bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
        <div className={`h-full rounded-full transition-all duration-400 ${bar}`} />
      </div>
      {/* Checks */}
      <div className="flex gap-3">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`flex items-center gap-1 text-[11px] transition-colors ${c.ok ? 'text-emerald-400' : 'text-white/25'}`}
          >
            <span>{c.ok ? '✓' : '○'}</span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function SignupPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

  const passwordValue = watch('password', '')

  const onSubmit = async (data: SignupForm) => {
    try {
      const result = await authService.signup({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      // Auto-login after signup
      await login(result.user.email, data.password)
      toast({
        variant: 'success',
        title: 'Account created!',
        description: `Welcome to AssetFlow, ${result.user.name}. Your employee account is ready.`,
        duration: 5000,
      })
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Signup failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60">
      {/* Card header */}
      <div className="border-b border-white/8 bg-white/3 px-6 py-4 text-center">
        <h1 className="text-base font-semibold tracking-wide text-white/90">
          AssetFlow – sign up
        </h1>
      </div>

      {/* Card body */}
      <div className="bg-[#0e0e12] px-6 pb-7 pt-6">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/15 bg-white/5 shadow-inner">
            <span className="text-lg font-bold tracking-wider text-white/80">AF</span>
          </div>
        </div>

        {/* Employee account notice */}
        <div className="mb-5 rounded-lg border border-indigo-500/15 bg-indigo-950/30 px-4 py-3">
          <p className="text-xs leading-relaxed text-indigo-300/70">
            🏢 &nbsp;Every sign-up creates an <span className="font-medium text-indigo-300">Employee account</span>.
            Admin roles are assigned by an administrator.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Full name */}
          <FormField id="name" label="Full name" error={errors.name?.message} required>
            <Input
              id="name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              error={!!errors.name}
              leftIcon={<User className="h-4 w-4" />}
              {...register('name')}
            />
          </FormField>

          {/* Email */}
          <FormField id="signup-email" label="Email address" error={errors.email?.message} required>
            <Input
              id="signup-email"
              type="email"
              placeholder="jane@company.com"
              autoComplete="email"
              error={!!errors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              {...register('email')}
            />
          </FormField>

          {/* Password */}
          <FormField id="signup-password" label="Password" error={errors.password?.message} required>
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
              error={!!errors.password}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-white/30 hover:text-white/70 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password')}
            />
            <PasswordStrength password={passwordValue} />
          </FormField>

          {/* Confirm password */}
          <FormField
            id="confirm-password"
            label="Confirm password"
            error={errors.confirmPassword?.message}
            required
          >
            <Input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-white/30 hover:text-white/70 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('confirmPassword')}
            />
          </FormField>

          {/* Terms notice */}
          <p className="text-xs text-white/25">
            By creating an account you agree to our{' '}
            <span className="cursor-pointer text-indigo-400/70 hover:text-indigo-400">Terms of Service</span>{' '}
            and{' '}
            <span className="cursor-pointer text-indigo-400/70 hover:text-indigo-400">Privacy Policy</span>.
          </p>

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isSubmitting}
            id="signup-submit-btn"
            className="mt-2"
          >
            {isSubmitting ? 'Creating your account…' : 'Create Account'}
          </Button>
        </form>

        {/* Back to login */}
        <div className="mt-5">
          <Separator className="mb-4" />
          <p className="text-center text-sm text-white/35">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
