import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

/**
 * Minimal dark auth layout — centered card on a near-black background.
 * Matches the wireframe: no split panel, just focus on the form card.
 */
export function AuthLayout() {
  const { pathname } = useLocation()

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a1040 0%, #080810 45%, #050508 100%)' }}
    >
      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow orbs */}
      <div className="pointer-events-none fixed left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/8 blur-3xl" />
      <div className="pointer-events-none fixed right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-purple-600/6 blur-3xl" />

      {/* Card container — max-w matches wireframe proportions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
