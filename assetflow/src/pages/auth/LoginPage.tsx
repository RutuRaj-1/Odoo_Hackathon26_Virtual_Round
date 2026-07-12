import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, Phone, Smartphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { ROUTES } from '@/constants'

// ─── Schemas ───────────────────────────────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^\+?[0-9\s\-()]+$/, 'Enter a valid phone number'),
})

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be digits only'),
})

type EmailForm = z.infer<typeof emailSchema>
type PhoneForm = z.infer<typeof phoneSchema>
type OtpForm = z.infer<typeof otpSchema>

// ─── Google Icon ───────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ─── Email Login Form ──────────────────────────────────────────────────────────
function EmailLoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const from = (location.state as { from?: Location })?.from?.pathname ?? ROUTES.DASHBOARD
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })

  const onSubmit = async (data: EmailForm) => {
    try {
      const result = await authService.loginWithEmail(data)
      // Persist to auth context
      await login(result.user.email, data.password)
      toast({ variant: 'success', title: 'Welcome back!', description: `Signed in as ${result.user.email}` })
      navigate(from, { replace: true })
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Sign in failed',
        description: err instanceof Error ? err.message : 'Invalid credentials.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          placeholder="admin@company.com"
          autoComplete="email"
          error={!!errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          {...register('email')}
        />
      </FormField>

      <FormField id="password" label="Password" error={errors.password?.message}>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••••"
          autoComplete="current-password"
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
        <div className="flex justify-end">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-xs text-white/40 hover:text-indigo-400 transition-colors"
          >
            Forgot password
          </Link>
        </div>
      </FormField>

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isSubmitting}
        id="email-login-btn"
        className="mt-2"
      >
        Sign in
      </Button>
    </form>
  )
}

// ─── Phone Login Form ──────────────────────────────────────────────────────────
function PhoneLoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) })
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) })

  const onPhoneSubmit = async (data: PhoneForm) => {
    try {
      await authService.sendPhoneOtp({ phoneNumber: data.phone })
      setPhoneNumber(data.phone)
      setStep('otp')
      toast({ variant: 'info', title: 'OTP Sent', description: `Verification code sent to ${data.phone}` })
    } catch (err) {
      toast({ variant: 'error', title: 'Failed to send OTP', description: err instanceof Error ? err.message : 'Please check the number and try again.' })
    }
  }

  const onOtpSubmit = async (data: OtpForm) => {
    try {
      const result = await authService.verifyPhoneOtp({ phoneNumber, otp: data.otp })
      await login(result.user.email || phoneNumber, '')
      toast({ variant: 'success', title: 'Phone verified!', description: 'You are now signed in.' })
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Verification failed',
        description: err instanceof Error ? err.message : 'Invalid OTP.',
      })
    }
  }

  return (
    <AnimatePresence mode="wait">
      {step === 'phone' ? (
        <motion.form
          key="phone-step"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
          noValidate
          className="space-y-4"
        >
          <FormField
            id="phone"
            label="Phone number"
            error={phoneForm.formState.errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              autoComplete="tel"
              error={!!phoneForm.formState.errors.phone}
              leftIcon={<Phone className="h-4 w-4" />}
              {...phoneForm.register('phone')}
            />
          </FormField>
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={phoneForm.formState.isSubmitting}
            id="send-otp-btn"
            className="mt-2"
          >
            Send verification code
          </Button>
        </motion.form>
      ) : (
        <motion.form
          key="otp-step"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          onSubmit={otpForm.handleSubmit(onOtpSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="rounded-lg border border-white/8 bg-white/3 px-4 py-3 text-sm text-white/60">
            Code sent to <span className="text-white font-medium">{phoneNumber}</span>
          </div>
          <FormField id="otp" label="Verification code" error={otpForm.formState.errors.otp?.message}>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              error={!!otpForm.formState.errors.otp}
              leftIcon={<Smartphone className="h-4 w-4" />}
              className="tracking-[0.4em] text-center"
              {...otpForm.register('otp')}
            />
          </FormField>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setStep('phone')}
            >
              Change number
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              loading={otpForm.formState.isSubmitting}
              id="verify-otp-btn"
            >
              Verify & sign in
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}

// ─── Main Login Page ───────────────────────────────────────────────────────────
export function LoginPage() {
  const { toast } = useToast()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const result = await authService.loginWithGoogle()
      await login(result.user.email, '')
      toast({ variant: 'success', title: 'Signed in with Google', description: result.user.email })
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      toast({ variant: 'error', title: 'Google sign-in failed', description: err instanceof Error ? err.message : 'Please try again.' })
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60">
      {/* Card header */}
      <div className="border-b border-white/8 bg-white/3 px-6 py-4 text-center">
        <h1 className="text-base font-semibold tracking-wide text-white/90">
          AssetFlow – login
        </h1>
      </div>

      {/* Card body */}
      <div className="bg-[#0e0e12] px-6 pb-7 pt-6">
        {/* Logo avatar */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/15 bg-white/5 shadow-inner">
            <span className="text-lg font-bold tracking-wider text-white/80">AF</span>
          </div>
        </div>

        {/* Login method tabs */}
        <Tabs defaultValue="email">
          <TabsList className="mb-5">
            <TabsTrigger value="email">
              <Mail className="h-3.5 w-3.5" /> Email
            </TabsTrigger>
            <TabsTrigger value="phone">
              <Phone className="h-3.5 w-3.5" /> Phone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <EmailLoginForm />
          </TabsContent>
          <TabsContent value="phone">
            <PhoneLoginForm />
          </TabsContent>
        </Tabs>

        {/* Social divider */}
        <div className="my-5 flex items-center gap-3">
          <Separator />
          <span className="shrink-0 text-xs text-white/25">or continue with</span>
          <Separator />
        </div>

        {/* Google sign-in */}
        <Button
          variant="subtle"
          fullWidth
          size="lg"
          onClick={handleGoogleLogin}
          loading={googleLoading}
          id="google-signin-btn"
          className="gap-3"
        >
          {!googleLoading && <GoogleIcon />}
          Sign in with Google
        </Button>

        {/* Section divider */}
        <div className="my-6">
          <Separator />
          <p className="mt-4 text-sm font-medium text-white/60">New here?</p>
        </div>

        {/* Info box — employee account notice (matches wireframe exactly) */}
        <div className="mb-4 rounded-lg border border-white/8 bg-white/3 px-4 py-3">
          <p className="text-sm leading-relaxed text-white/50">
            Sign up creates an employee account
            <br />
            <span className="text-white/35 text-xs">Admin roles are assigned by an administrator later</span>
          </p>
        </div>

        {/* Create Account CTA */}
        <Button
          variant="outline"
          fullWidth
          size="lg"
          asChild
          id="create-account-btn"
        >
          <Link to={ROUTES.SIGNUP}>Create Account</Link>
        </Button>
      </div>
    </div>
  )
}
