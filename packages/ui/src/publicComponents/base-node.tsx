import { cn } from '@/lib/utils'
import { Position } from '@xyflow/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { PropsWithChildren } from 'react'
import { BaseHandle } from './base-handle'

const baseNodeVariants = cva('relative flex flex-col min-w-[300px] bg-[#1A1A1A] rounded-md overflow-hidden font-mono', {
  variants: {
    variant: {
      default: 'bg-green-950/40', // Event nodes (was previously just using the base bg)
      trigger: 'bg-blue-950/40', // API nodes (was using sky)
      noop: 'bg-zinc-9850/40',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type Props = PropsWithChildren<{
  variant?: VariantProps<typeof baseNodeVariants>['variant']
  title: string
  headerChildren?: React.ReactNode
  className?: string
  disableSourceHandle?: boolean
  disableTargetHandle?: boolean
}>

const HeaderBar = ({ text, children }: { text: string; children?: React.ReactNode }) => (
  <div className="px-3 py-1 border-b border-white/20 bg-black/30 text-xs text-white/70 flex justify-between items-center">
    <span>{text}</span>
    {children}
  </div>
)

export const BaseNode = (props: Props) => {
  const { title, variant, className, children, disableSourceHandle, disableTargetHandle, headerChildren } = props

  return (
    <div className="group relative">
      {/* Border container */}
      <div className="absolute -inset-[1px] rounded-md bg-gradient-to-r from-white/20 to-white/10" />

      {/* Main node content */}
      <div className={cn(baseNodeVariants({ variant }), className)}>
        <HeaderBar text={title} children={headerChildren} />

        <div className="p-4 space-y-3">{children}</div>
      </div>

      {/* Connection points */}
      {!disableTargetHandle && <BaseHandle type="target" position={Position.Top} />}
      {!disableSourceHandle && <BaseHandle type="source" position={Position.Bottom} />}

      {/* Stacked card effect */}
      <div className="absolute inset-0 -z-10 translate-y-1 translate-x-1 bg-black/20 rounded-md border border-white/5" />
    </div>
  )
}
