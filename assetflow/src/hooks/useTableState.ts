import { useCallback, useState } from 'react'
import type { PaginationParams, SortParams, FilterParams } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/constants'

interface UseTableStateOptions {
  defaultPageSize?: number
  defaultSortField?: string
  defaultSortDirection?: SortParams['direction']
}

/**
 * Manages pagination, sorting, and filter state for data tables.
 * Keeps all table parameters in a single composable hook.
 */
export function useTableState(options: UseTableStateOptions = {}) {
  const {
    defaultPageSize = DEFAULT_PAGE_SIZE,
    defaultSortField = 'createdAt',
    defaultSortDirection = 'desc',
  } = options

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: defaultPageSize,
  })

  const [sort, setSort] = useState<SortParams>({
    field: defaultSortField,
    direction: defaultSortDirection,
  })

  const [filters, setFilters] = useState<FilterParams>({})

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }, [])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination({ page: 1, pageSize })
  }, [])

  const handleSortChange = useCallback((field: string) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handleFilterChange = useCallback((updates: Partial<FilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({})
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  return {
    pagination,
    sort,
    filters,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleFilterChange,
    resetFilters,
  } as const
}
