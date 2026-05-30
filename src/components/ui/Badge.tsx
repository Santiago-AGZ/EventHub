import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        {
          "bg-blue-100 text-blue-800 border border-blue-200": variant === 'primary',
          "bg-emerald-100 text-emerald-800 border border-emerald-200": variant === 'success',
          "bg-amber-100 text-amber-800 border border-amber-200": variant === 'warning',
          "bg-red-100 text-red-800 border border-red-200": variant === 'error',
          "bg-slate-100 text-slate-800 border border-slate-200": variant === 'neutral',
        },
        className
      )}
      {...props}
    />
  )
}
