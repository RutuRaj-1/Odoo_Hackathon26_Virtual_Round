import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium',
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
    'disabled:pointer-events-none disabled:opacity-40 select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        // Filled — primary action
        default:
          'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-900/30',
        // Outlined — secondary / "Create Account" style from wireframe
        outline:
          'border border-white/15 bg-transparent text-white hover:bg-white/5 hover:border-white/30 active:bg-white/10',
        // Ghost — minimal, no border
        ghost:
          'text-white/70 hover:bg-white/6 hover:text-white active:bg-white/10',
        // Subtle filled — info box / social buttons
        subtle:
          'bg-white/6 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 active:bg-white/14',
        // Destructive
        destructive:
          'bg-red-600/90 text-white hover:bg-red-500 active:bg-red-700',
        // Link style
        link: 'text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300 p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-10 px-4',
        lg: 'h-11 px-6',
        xl: 'h-12 px-8 text-base rounded-xl',
        icon: 'h-9 w-9 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, fullWidth, asChild = false, loading = false, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
