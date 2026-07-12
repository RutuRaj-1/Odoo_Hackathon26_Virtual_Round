import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { firestoreService } from '@/services/firestoreService'
import { bookingService } from '@/services/bookingService'
import { maintenanceService } from '@/services/maintenanceService'
import {
  Search,
  Package,
  Users,
  Calendar,
  Wrench,
  Building2,
  FolderOpen,
  X,
  Loader2,
  CornerDownLeft
} from 'lucide-react'

// ─── Search Types ─────────────────────────────────────────────────────────────
interface SearchResult {
  id: string
  title: string
  subtitle: string
  type: 'Asset' | 'Employee' | 'Booking' | 'Maintenance' | 'Department' | 'Category'
  url: string
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const { value, debouncedValue, setValue } = useDebounce('', { delay: 300 })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  
  // Cache to store loaded items for fast client-side querying
  const dataCache = useRef<{
    assets: any[]
    employees: any[]
    departments: any[]
    categories: any[]
    bookings: any[]
    maintenances: any[]
  } | null>(null)

  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)

  // Fetch all search metadata once on focus/click to build search index
  const loadSearchData = async () => {
    if (dataCache.current) return // Already loaded
    setLoading(true)
    try {
      const [assets, employees, departments, categories, bookingsResponse, maintenanceResponse] = await Promise.all([
        firestoreService.getAssets(),
        firestoreService.getEmployees(),
        firestoreService.getDepartments(),
        firestoreService.getCategories(),
        bookingService.getAll({ page: 1, pageSize: 200 }),
        maintenanceService.getAll({ page: 1, pageSize: 200 })
      ])

      dataCache.current = {
        assets,
        employees,
        departments,
        categories,
        bookings: bookingsResponse.data,
        maintenances: maintenanceResponse.data
      }
    } catch (error) {
      console.error('Error loading search database:', error)
    } finally {
      setLoading(false)
    }
  }

  // Effect to perform filtering when debounced query changes
  useEffect(() => {
    if (!debouncedValue.trim() || !dataCache.current) {
      setResults([])
      return
    }

    const query = debouncedValue.toLowerCase().trim()
    const matches: SearchResult[] = []
    const cache = dataCache.current

    // 1. Assets search (by tag, name, serial number)
    cache.assets.forEach(asset => {
      if (
        asset.assetName.toLowerCase().includes(query) ||
        asset.assetTag.toLowerCase().includes(query) ||
        asset.serialNumber.toLowerCase().includes(query)
      ) {
        matches.push({
          id: asset.assetId,
          title: asset.assetName,
          subtitle: `${asset.assetTag} • ${asset.location || 'No Location'}`,
          type: 'Asset',
          url: `/assets/${asset.assetId}`
        })
      }
    })

    // 2. Employees search (by name, email)
    cache.employees.forEach(emp => {
      if (
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query)
      ) {
        matches.push({
          id: emp.uid,
          title: emp.name,
          subtitle: `${emp.email} • ${emp.role}`,
          type: 'Employee',
          url: `/employees/${emp.uid}`
        })
      }
    })

    // 3. Departments search (by name, code)
    cache.departments.forEach(dept => {
      if (
        dept.name.toLowerCase().includes(query) ||
        dept.departmentCode.toLowerCase().includes(query)
      ) {
        matches.push({
          id: dept.departmentId,
          title: dept.name,
          subtitle: `Code: ${dept.departmentCode} • Status: ${dept.status}`,
          type: 'Department',
          url: '/admin/organization'
        })
      }
    })

    // 4. Categories search (by name, description)
    cache.categories.forEach(cat => {
      if (
        cat.name.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
      ) {
        matches.push({
          id: cat.categoryId,
          title: cat.name,
          subtitle: `Warranty: ${cat.warrantyPeriod} Months`,
          type: 'Category',
          url: '/admin/organization'
        })
      }
    })

    // 5. Bookings search (by booking number, purpose, requester)
    cache.bookings.forEach(bk => {
      if (
        bk.bookingNumber.toLowerCase().includes(query) ||
        bk.purpose.toLowerCase().includes(query) ||
        bk.requestedBy.toLowerCase().includes(query)
      ) {
        matches.push({
          id: bk.id,
          title: `${bk.bookingNumber} - ${bk.purpose}`,
          subtitle: `Status: ${bk.status} • Requested By: ${bk.requestedBy}`,
          type: 'Booking',
          url: `/bookings/${bk.id}`
        })
      }
    })

    // 6. Maintenance search (by ticket number, title, description)
    cache.maintenances.forEach(m => {
      if (
        m.ticketNumber.toLowerCase().includes(query) ||
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query)
      ) {
        matches.push({
          id: m.id,
          title: `${m.ticketNumber} - ${m.title}`,
          subtitle: `Priority: ${m.priority} • Status: ${m.status}`,
          type: 'Maintenance',
          url: `/maintenance/${m.id}`
        })
      }
    })

    // Limit to 10 overall search results for clean display
    setResults(matches.slice(0, 10))
  }, [debouncedValue])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        setOpen(true)
        loadSearchData()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const selectResult = (result: SearchResult) => {
    navigate(result.url)
    setOpen(false)
    setValue('')
  }

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'Asset': return <Package className="h-4 w-4 text-[#B36B9E]" />
      case 'Employee': return <Users className="h-4 w-4 text-emerald-500" />
      case 'Booking': return <Calendar className="h-4 w-4 text-blue-500" />
      case 'Maintenance': return <Wrench className="h-4 w-4 text-orange-500" />
      case 'Department': return <Building2 className="h-4 w-4 text-purple-500" />
      case 'Category': return <FolderOpen className="h-4 w-4 text-amber-500" />
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-[280px]">
      {/* Search Input trigger */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setOpen(true)
            loadSearchData()
          }}
          onFocus={() => {
            setOpen(true)
            loadSearchData()
          }}
          placeholder="Search... (Ctrl+K)"
          className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
        {value && (
          <button
            onClick={() => {
              setValue('')
              setResults([])
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {open && (value.trim().length > 0 || loading) && (
        <div className="absolute right-0 mt-2 z-50 w-[360px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Indexing ERP resources...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground px-4">
              No results found for <span className="font-semibold text-foreground">"{value}"</span>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto p-2 divide-y divide-border/40">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                ERP Search Results ({results.length})
              </div>
              <div className="pt-1.5 space-y-0.5">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => selectResult(result)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted/40 transition-colors group"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/50 border border-border/60">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {result.title}
                        </span>
                        <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground border border-border/40">
                          {result.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {result.subtitle}
                      </p>
                    </div>
                    <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-primary/70 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
