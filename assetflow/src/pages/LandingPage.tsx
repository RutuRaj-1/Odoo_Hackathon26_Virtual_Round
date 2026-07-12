import { useAuth } from '@/hooks/useAuth'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '@/constants'
import {
  Package,
  Users,
  CalendarCheck,
  Wrench,
  ShieldCheck,
  Building2,
  TrendingUp,
  Workflow,
  ArrowRight,
  Database,
  Grid
} from 'lucide-react'

import { AssetFlowLogo } from '@/components/common/AssetFlowLogo'

export function LandingPage() {
  const { uid, loading } = useAuth()

  // Redirect to dashboard if logged in
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (uid !== null) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* ─── Navigation Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <AssetFlowLogo className="h-9 w-9" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-[#B36B9E] bg-clip-text text-transparent">
              AssetFlow
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to={ROUTES.LOGIN}
              className="text-sm font-medium hover:text-primary transition-colors px-3 py-2"
            >
              Login
            </Link>
            <Link
              to={ROUTES.SIGNUP}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary/5),transparent)]" />
        
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Next-Gen ERP for Modern Workspaces
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl max-w-3xl mx-auto leading-tight"
          >
            Enterprise Asset & Resource Management System
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto"
          >
            AssetFlow enables organizations to efficiently manage assets, departments, maintenance workflows, employee allocations, bookings, and enterprise operations through one centralized ERP platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link
              to={ROUTES.SIGNUP}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-95 transition-opacity"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
            >
              Sign In to Organization
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Grid ───────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/40 bg-card/20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Powering Operational Control
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to orchestrate physical logistics, resource scheduling, and administrative safety compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Strict Role-Based Access Control",
                desc: "Secure workspaces with custom permissions for Admins, Asset Managers, Department Heads, and Employees."
              },
              {
                icon: Workflow,
                title: "Automated Maintenance Lifecycles",
                desc: "Log repairs and track status from Scheduled to In Progress and Completed with automatic availability updates."
              },
              {
                icon: CalendarCheck,
                title: "Conflict-Aware Resource Bookings",
                desc: "Prevent resource double-booking with real-time reservation scheduling and validation checks."
              },
              {
                icon: Building2,
                title: "Flexible Organization Hierarchy",
                desc: "Map departments, asset categories, physical facilities, and employee trees effortlessly."
              },
              {
                icon: TrendingUp,
                title: "Live Analytical Breakdowns",
                desc: "Monitor asset usage, maintenance statistics, and inventory trends using sleek, interactive charts."
              },
              {
                icon: Database,
                title: "Cloud-Synchronized Ledger",
                desc: "Keep records synchronized with a fast, transaction-safe Cloud Firestore database."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="relative rounded-2xl border border-border/60 bg-card p-8 hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Modules Overview ────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Integrated Modules
            </h2>
            <p className="mt-4 text-muted-foreground">
              A unified command center mapping key operational flows.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Users,
                title: "Employee Registry",
                desc: "Organize employees, manage team assignments, and control security levels."
              },
              {
                icon: Package,
                title: "Asset Catalog",
                desc: "Track hardware specifications, warranty details, physical locations, and status logs."
              },
              {
                icon: CalendarCheck,
                title: "Resource Bookings",
                desc: "Reserve conference rooms, vehicles, and high-value devices with scheduling grids."
              },
              {
                icon: Wrench,
                title: "Maintenance Hub",
                desc: "File repair request logs, delegate maintenance heads, and monitor expense details."
              }
            ].map((mod, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/40 bg-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary mb-4">
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-foreground">{mod.title}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── User Roles Comparison ────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/40 bg-card/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tailored Access Controls
            </h2>
            <p className="mt-4 text-muted-foreground">
              Granular workflows customized around organizational roles.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full border-collapse text-left text-sm text-foreground">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Capability</th>
                  <th className="px-6 py-4 text-center">Employee</th>
                  <th className="px-6 py-4 text-center">Dept Head</th>
                  <th className="px-6 py-4 text-center">Asset Mgr</th>
                  <th className="px-6 py-4 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { name: "View Allocated Inventory", roles: [true, true, true, true] },
                  { name: "Submit Booking Requests", roles: [true, true, true, true] },
                  { name: "Submit Maintenance Requests", roles: [true, true, true, true] },
                  { name: "Approve Booking Allocations", roles: [false, true, true, true] },
                  { name: "Register Assets / Edit Catalog", roles: [false, false, true, true] },
                  { name: "Promote Roles / Edit Departments", roles: [false, false, false, true] }
                ].map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{row.name}</td>
                    {row.roles.map((hasAccess, cIdx) => (
                      <td key={cIdx} className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${hasAccess ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/5 text-rose-300'}`}>
                          {hasAccess ? "✓" : "—"}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-12 bg-background">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <AssetFlowLogo className="h-6 w-6" />
            <span className="text-base font-bold text-foreground">AssetFlow</span>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 AssetFlow. Enterprise Asset & Resource Management ERP. All rights reserved.
          </p>

          <div className="flex gap-4">
            <Link to={ROUTES.LOGIN} className="text-xs text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
            <Link to={ROUTES.SIGNUP} className="text-xs text-muted-foreground hover:text-foreground">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
