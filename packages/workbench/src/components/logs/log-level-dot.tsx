import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva('text-xs font-medium tracking-wide w-2 h-2 rounded-full mx-1', {
  variants: {
    variant: {
      info: 'bg-sky-500',
      trace: 'bg-sky-500',
      debug: 'bg-sky-500',
      error: 'bg-rose-500',
      fatal: 'bg-rose-500',
      warn: 'bg-amber-500',
    },
  },
})

export const LogLevelDot: React.FC<{ level: string }> = ({ level }) => {
  return <div className={badgeVariants({ variant: level as VariantProps<typeof badgeVariants>['variant'] })} />
}
