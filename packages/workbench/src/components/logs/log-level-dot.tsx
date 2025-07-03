import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva('text-xs font-medium tracking-wide rounded-full h-[6px] w-[6px] m-[4px] outline-[2px]', {
  variants: {
    variant: {
      info: 'bg-[#2862FE] outline-[#2862FE]/20',
      trace: 'bg-sky-500 outline-sky-500',
      debug: 'bg-sky-500 outline-sky-500',
      error: 'bg-rose-500 outline-rose-500',
      fatal: 'bg-rose-500 outline-rose-500',
      warn: 'bg-amber-500 outline-amber-500',
    },
  },
})

export const LogLevelDot: React.FC<{ level: string }> = ({ level }) => {
  return <div className={badgeVariants({ variant: level as VariantProps<typeof badgeVariants>['variant'] })} />
}
