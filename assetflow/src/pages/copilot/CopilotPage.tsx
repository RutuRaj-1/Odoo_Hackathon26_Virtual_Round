import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Download, RefreshCw, AlertCircle, CheckCircle2, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { firestoreService } from '@/services/firestoreService'

export function CopilotPage() {
  const { uid } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateSummary = async () => {
    if (!uid) return
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      // 1. Fetch live real-time data from Firestore
      const stats = await firestoreService.getDashboardStats(uid)

      // Transform for LLM prompt
      const payloadData = {
        total_assets: stats.counts.totalAssets,
        available: stats.counts.availableAssets,
        allocated: stats.counts.allocatedAssets,
        departments: stats.counts.totalDepartments,
        employees: stats.counts.totalEmployees,
        maintenance_tickets: {
          open: stats.counts.openMaintenance
        }
      }

      // 2. Call FastAPI Backend
      const res = await fetch('http://localhost:8000/api/copilot/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: 'dashboard',
          data: payloadData
        })
      })

      if (!res.ok) {
        throw new Error(`Backend Error: ${res.statusText}`)
      }

      const data = await res.json()
      setResponse(data.explanation)
      toast({ variant: 'success', title: 'Generation Complete', description: 'AI Summary has been generated.' })

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to connect to the Copilot Backend. Is FastAPI running?')
      toast({ variant: 'error', title: 'Generation Failed', description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!response) return
    const blob = new Blob([response], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AssetFlow_AI_Summary_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ variant: 'success', title: 'Exported', description: 'Summary downloaded successfully.' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10">
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AssetFlow Copilot</h2>
            <p className="text-sm text-white/60">
              Your AI-powered Operations Analyst. Powered by local Ollama LLMs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {response && (
            <Button onClick={handleExport} variant="outline" className="gap-2 bg-transparent border-white/10 text-white hover:bg-white/10">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          <Button 
            onClick={generateSummary} 
            disabled={loading}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white min-w-[160px]"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : response ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? 'Generating...' : response ? 'Regenerate' : 'Generate Summary'}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0c0c0f] shadow-sm overflow-hidden min-h-[300px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-indigo-400/80 space-y-4">
            <RefreshCw className="h-10 w-10 animate-spin" />
            <p className="text-sm font-medium animate-pulse text-white/60">
              Analyzing real-time Firestore metrics...
            </p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-rose-400/80 space-y-4">
            <AlertCircle className="h-10 w-10" />
            <div className="text-center">
              <p className="text-sm font-medium text-white/80">Connection Error</p>
              <p className="text-xs text-white/50 max-w-sm mt-1">{error}</p>
            </div>
            <Button onClick={generateSummary} variant="outline" className="mt-2 bg-transparent border-white/10 text-white hover:bg-white/10">
              Try Again
            </Button>
          </div>
        ) : response ? (
          <div className="p-6 md:p-8 flex gap-4 md:gap-6">
            <div className="hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
              <Bot className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex-1 space-y-4 text-white/80 leading-relaxed text-sm md:text-base">
              {/* Process standard line breaks into paragraphs for better readability */}
              {response.split('\n\n').map((paragraph, i) => (
                <p key={i} className="whitespace-pre-wrap">{paragraph.trim()}</p>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-white/40 space-y-4">
            <Bot className="h-12 w-12 text-white/20" />
            <div className="text-center">
              <p className="text-sm font-medium text-white/70">Ready to analyze</p>
              <p className="text-xs max-w-sm mt-1">
                Click "Generate Summary" to compile your live database metrics and produce an executive operational report.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
