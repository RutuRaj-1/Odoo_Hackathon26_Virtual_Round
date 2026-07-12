import * as React from 'react'
import { cn } from '@/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Shows red ring + border on error */
  error?: boolean
  /** Optional icon rendered on the left */
  leftIcon?: React.ReactNode
  /** Optional icon/button rendered on the right */
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-white/30">
            {leftIcon}
          </span>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            // Base
            'flex h-11 w-full rounded-lg border bg-white/4 px-3 py-2 text-sm text-white',
            'placeholder:text-white/25 transition-all duration-200',
            // Border
            error
              ? 'border-red-500/50 focus:border-red-400/60 focus:ring-red-400/20'
              : 'border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20',
            // Focus ring
            'focus:outline-none focus:ring-2',
            // Disabled
            'disabled:cursor-not-allowed disabled:opacity-40',
            // Icon padding adjustments
            leftIcon && 'pl-9',
            rightIcon && 'pr-10',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 flex items-center">{rightIcon}</span>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
