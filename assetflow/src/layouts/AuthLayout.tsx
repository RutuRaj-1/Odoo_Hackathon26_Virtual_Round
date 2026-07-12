import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel – Branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/70 p-12 lg:flex">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">AssetFlow</span>
        </div>

        {/* Hero copy */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-4xl font-bold leading-tight text-white">
              Enterprise Asset
              <br />
              Management, <span className="text-white/70">Reimagined.</span>
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Track, manage, and optimize every asset across your organization — from procurement to
              retirement.
            </p>
          </motion.div>

          {/* Stats pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex gap-4"
          >
            {[
              { label: 'Assets Tracked', value: '50K+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'Teams', value: '2K+' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="relative text-sm text-white/40">
          © {new Date().getFullYear()} AssetFlow. Enterprise Asset & Resource Management.
        </p>
      </div>

      {/* Right Panel – Auth Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-8">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">AssetFlow</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
