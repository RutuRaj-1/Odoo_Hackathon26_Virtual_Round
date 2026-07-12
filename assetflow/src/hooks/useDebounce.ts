import { useCallback, useState } from 'react'
import { debounce } from '@/utils'

interface UseDebounceOptions {
  delay?: number
}

/**
 * Returns a debounced version of the value and a setter.
 * Useful for search inputs to avoid firing on every keystroke.
 */
export function useDebounce<T>(initialValue: T, options: UseDebounceOptions = {}) {
  const { delay = 400 } = options
  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setDebounced = useCallback(
    debounce((v: unknown) => setDebouncedValue(v as T), delay),
    [delay],
  )

  const handleChange = useCallback(
    (v: T) => {
      setValue(v)
      setDebounced(v)
    },
    [setDebounced],
  )

  return { value, debouncedValue, setValue: handleChange } as const
}
