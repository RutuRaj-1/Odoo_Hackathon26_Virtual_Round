import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Building,
  Palette,
  Bell,
  Shield,
  Info,
  Check,
  Sun,
  Moon,
  Laptop,
  Upload,
  Globe,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'

type TabType = 'profile' | 'organization' | 'appearance' | 'notifications' | 'security' | 'about'

export function SettingsPage() {
  const { currentUser: user, updateUser } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<TabType>('profile')

  // Profile Form States
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profileEmail, setProfileEmail] = useState(user?.email || '')
  const [designation, setDesignation] = useState('Senior Systems Administrator')

  // Organization Form States
  const [orgName, setOrgName] = useState('Odoo Hackathon Org')
  const [orgDomain, setOrgDomain] = useState('odoohackathon-virtualround.com')
  const [orgAddress, setOrgAddress] = useState('Grand Central Park, New York, NY')

  // Notifications Preferences States
  const [notifPreferences, setNotifPreferences] = useState({
    emailAlerts: true,
    maintenanceAlerts: true,
    bookingApprovals: true,
    slackIntegration: false
  })

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileName.trim()) {
      toast({ variant: 'error', title: 'Validation Error', description: 'Name cannot be empty.' })
      return
    }
    updateUser({ name: profileName })
    toast({ variant: 'success', title: 'Profile Updated', description: 'Your personal settings have been saved.' })
  }

  const handleOrgSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast({ variant: 'success', title: 'Organization Config Saved', description: 'Company configurations updated.' })
  }

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: 'error', title: 'Validation Error', description: 'All fields are required.' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'error', title: 'Mismatch Error', description: 'Passwords do not match.' })
      return
    }
    toast({ variant: 'success', title: 'Security Updated', description: 'Your password has been changed.' })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage organization configurations, accessibility themes, and security credentials.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0 rounded-xl border border-border bg-card p-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'organization', label: 'Organization', icon: Building },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security & Access', icon: Shield },
            { id: 'about', label: 'About System', icon: Info }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 w-full rounded-lg px-3.5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Panel Content Box */}
        <div className="flex-1 w-full rounded-xl border border-border bg-card shadow-sm p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* ─── Profile Tab ─── */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-6 max-w-xl">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">Personal Details</h3>
                  <p className="text-xs text-muted-foreground">Update your directory registry and personal details.</p>
                </div>

                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold font-mono">
                    {profileName ? profileName.slice(0,2).toUpperCase() : 'AF'}
                  </div>
                  <div>
                    <Button type="button" variant="outline" size="sm" className="gap-2">
                      <Upload className="h-3.5 w-3.5" /> Upload Avatar
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1.5">Max size 2MB. JPG, PNG formats only.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField id="profile-name" label="Full Name" required>
                    <Input
                      id="profile-name"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      placeholder="Jane Smith"
                    />
                  </FormField>
                  <FormField id="profile-email" label="Email Address" required>
                    <Input
                      id="profile-email"
                      value={profileEmail}
                      onChange={e => setProfileEmail(e.target.value)}
                      disabled
                      placeholder="jane@company.com"
                    />
                  </FormField>
                  <FormField id="profile-role" label="Current Role">
                    <Input id="profile-role" value={user?.role || 'Employee'} disabled />
                  </FormField>
                  <FormField id="profile-des" label="Designation">
                    <Input
                      id="profile-des"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      placeholder="Product Lead"
                    />
                  </FormField>
                </div>

                <Button type="submit" className="bg-primary text-primary-foreground">
                  Save Settings
                </Button>
              </form>
            )}

            {/* ─── Organization Tab ─── */}
            {activeTab === 'organization' && (
              <form onSubmit={handleOrgSave} className="space-y-6 max-w-xl">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">Organization Setup</h3>
                  <p className="text-xs text-muted-foreground">Adjust company profile information and default settings.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField id="org-name" label="Organization Name" required>
                    <Input
                      id="org-name"
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      placeholder="Acme ERP"
                    />
                  </FormField>
                  <FormField id="org-domain" label="Primary Email Domain" required>
                    <Input
                      id="org-domain"
                      value={orgDomain}
                      onChange={e => setOrgDomain(e.target.value)}
                      placeholder="acme-erp.com"
                    />
                  </FormField>
                  <FormField id="org-address" label="Headquarters Address">
                    <Input
                      id="org-address"
                      value={orgAddress}
                      onChange={e => setOrgAddress(e.target.value)}
                      placeholder="123 Corporate Way"
                    />
                  </FormField>
                </div>

                <Button type="submit" className="bg-primary text-primary-foreground">
                  Save Organization Info
                </Button>
              </form>
            )}

            {/* ─── Appearance Tab ─── */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">Visual Appearance</h3>
                  <p className="text-xs text-muted-foreground">Personalize how AssetFlow looks on your screen.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Theme Palette</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon }
                    ].map(mode => {
                      const Icon = mode.icon
                      const isSelected = mode.id === resolvedTheme
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setTheme(mode.id as 'light' | 'dark')}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-semibold transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border bg-background hover:bg-muted/30 text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{mode.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Odoo Enterprise Color</label>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#714B67] border border-black/25 flex items-center justify-center text-white text-xs">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">Odoo Purple (#714B67) - Default theme</span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Notifications Tab ─── */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">Notification Preferences</h3>
                  <p className="text-xs text-muted-foreground">Select how and when you receive system alerts.</p>
                </div>

                <div className="space-y-4 divide-y divide-border">
                  {[
                    { id: 'emailAlerts', label: 'Email Notifications', desc: 'Receive critical activity digests and reports via email.' },
                    { id: 'maintenanceAlerts', label: 'Maintenance Requests', desc: 'Get notified when assets are placed under maintenance.' },
                    { id: 'bookingApprovals', label: 'Booking Allocations', desc: 'Receive status reports for scheduling and resource approvals.' },
                    { id: 'slackIntegration', label: 'Slack Webhook Integration', desc: 'Forward critical system logs to designated company channels.' }
                  ].map(item => (
                    <div key={item.id} className="flex items-start justify-between gap-4 pt-4 first:pt-0">
                      <div className="flex-1 min-w-0">
                        <label className="text-sm font-semibold text-foreground block">{item.label}</label>
                        <span className="text-xs text-muted-foreground leading-relaxed block mt-0.5">{item.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifPreferences[item.id as keyof typeof notifPreferences]}
                        onChange={(e) => setNotifPreferences(prev => ({ ...prev, [item.id]: e.target.checked }))}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Security Tab ─── */}
            {activeTab === 'security' && (
              <form onSubmit={handleSecuritySave} className="space-y-6 max-w-xl">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">Password Credentials</h3>
                  <p className="text-xs text-muted-foreground">Ensure your account uses a secure password to protect organization logs.</p>
                </div>

                <div className="space-y-4">
                  <FormField id="cur-pass" label="Current Password" required>
                    <Input
                      id="cur-pass"
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </FormField>
                  <FormField id="new-pass" label="New Password" required>
                    <Input
                      id="new-pass"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </FormField>
                  <FormField id="conf-pass" label="Confirm Password" required>
                    <Input
                      id="conf-pass"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </FormField>
                </div>

                <Button type="submit" className="bg-primary text-primary-foreground">
                  Update Password
                </Button>
              </form>
            )}

            {/* ─── About Tab ─── */}
            {activeTab === 'about' && (
              <div className="space-y-6 max-w-xl text-foreground">
                <div>
                  <h3 className="text-base font-bold mb-1">System Information</h3>
                  <p className="text-xs text-muted-foreground">Technical metadata relating to the AssetFlow ERP build.</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Product Name:</span>
                    <span className="font-semibold">AssetFlow ERP</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Version:</span>
                    <span>v1.0.0 (Production)</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Environment:</span>
                    <span className="text-emerald-500">Active</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Vite Build Target:</span>
                    <span>esnext</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Server Region:</span>
                    <span className="flex items-center gap-1.5"><Globe className="h-3 w-3 text-primary" /> us-east-1 (Firestore)</span>
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-muted-foreground">
                  AssetFlow is built for the Odoo Hackathon 2026 Virtual Round.
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
