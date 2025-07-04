import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import { CalendarClock, CircleOff, CloudDownload, Waypoints } from 'lucide-react'

const baseIcon = cva('rounded-md p-3', {
  variants: {
    variant: {
      event: 'bg-[rgba(30,118,231,0.2)] text-[rgb(30,118,231)]',
      api: 'bg-[rgba(192,255,17,0.2)] text-[rgb(192,255,17)]',
      noop: 'bg-[rgba(239,18,229,0.2)] text-[rgb(239,18,229)]',
      cron: 'bg-[rgba(241,105,15,0.2)] text-[rgb(241,105,15)]',
    },
  },
})

const NodeIcon = ({ variant }: { variant: VariantProps<typeof baseIcon>['variant'] }) => {
  if (variant === 'cron') {
    return <CalendarClock className="w-5 h-5" />
  } else if (variant === 'api') {
    return <CloudDownload className="w-5 h-5" />
  } else if (variant === 'noop') {
    return <CircleOff className="w-5 h-5" />
  } else if (variant === 'event') {
    return <Waypoints className="w-5 h-5" />
  }
  return <div className={cn(baseIcon({ variant }))}>Icon</div>
}

export const NodeHeader = ({
  text,
  variant,
  children,
  subtitle,
}: {
  text: string
  subtitle?: string
  variant: VariantProps<typeof baseIcon>['variant']
  children?: React.ReactNode
}) => (
  <div className="flex items-center gap-4 p-4">
    <div className={baseIcon({ variant })}>
      <NodeIcon variant={variant} />
    </div>
    <div className="flex flex-1 justify-between items-center gap-4">
      <div className="flex flex-col">
        <div className="font-semibold text-md">{text}</div>
        {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
      </div>
      {children}
    </div>
  </div>
)
