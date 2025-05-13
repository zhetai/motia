import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        POST: 'bg-sky-500/50 text-sky-100',
        GET: 'bg-lime-500/50 text-lime-100',
        PUT: 'bg-yellow-500/50 text-yellow-100',
        DELETE: 'bg-red-500/50 text-red-100',
        PATCH: 'bg-yellow-500/50 text-yellow-100',
        HEAD: 'bg-blue-500/50 text-blue-100',
        OPTIONS: 'bg-purple-500/50 text-purple-100',
      },
      defaultVariants: {
        variant: 'bg-blue-500/50 text-blue-100',
      },
    },
  },
)

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function EndpointBadge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
