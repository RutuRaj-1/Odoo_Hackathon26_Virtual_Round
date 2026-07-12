import * as React from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils'

interface FormFieldProps {
  id: string
  label?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Wraps a form control with a label, hint, and inline error message.
 * Passes the error state down via the `error` data attribute so
 * the child Input can read it via CSS (or use cloneElement if needed).
 */
export function FormField({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-white/35">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400" role="alert">
          <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
