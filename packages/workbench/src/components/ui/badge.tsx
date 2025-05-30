import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        info: 'border-transparent bg-[#47B2FF33] text-[#47B2FF] hover:bg-sky/80',
        error: 'border-transparent bg-rose-500 text-black shadow hover:bg-rose/80',
        warning: 'border-transparent bg-amber-300 text-amber-950 hover:bg-amber/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        'red-rounded': 'border-transparent bg-red-500 text-red-950 hover:bg-red/80 rounded-full',
        'red-dot': 'border-transparent bg-red-500 rounded-full w-2 h-2 p-0',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
