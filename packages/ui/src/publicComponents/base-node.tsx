import { Position } from '@xyflow/react'
import { BaseHandle } from './base-handle'
import { BaseNodeProps } from './node-props'
import { Emits } from './emits'
import { Subscribe } from './subscribe'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

const baseNodeVariants = cva(
  'relative flex flex-col min-w-[300px] bg-[#1A1A1A] rounded-md overflow-hidden font-mono',
  {
    variants: {
      variant: {
        default: 'bg-zinc-950/40',  // Event nodes (was previously just using the base bg)
        trigger: 'bg-blue-950/40',   // API nodes (was using sky)
        noop: 'bg-teal-950/40',  
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type Props = PropsWithChildren<
  BaseNodeProps & {
    variant?: VariantProps<typeof baseNodeVariants>['variant']
    excludePubsub?: boolean
    className?: string
  }
>

const HeaderBar = ({ text }: { text: string }) => (
  <div className="px-3 py-1 border-b border-white/20 bg-black/30 text-xs text-white/70 flex justify-between items-center">
    <span>{text}</span>
  </div>
)

export const BaseNode = (props: Props) => {
  const { data, variant, excludePubsub, className, children } = props

  return (
    <div className="group relative">
      {/* Border container */}
      <div className="absolute -inset-[1px] rounded-md bg-gradient-to-r from-white/20 to-white/10" />
      
      {/* Main node content */}
      <div className={cn(baseNodeVariants({ variant }), className)}>
        <HeaderBar text={data.name} />
        
        <div className="p-4 space-y-3">
          {data.description && (
            <div className="text-sm text-white/60">{data.description}</div>
          )}
          {children}
          {!excludePubsub && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <Subscribe data={data} />
              <Emits emits={data.emits} />
            </div>
          )}
        </div>
      </div>

      {/* Connection points */}
      <BaseHandle type="target" position={Position.Top} />
      {data.emits.length > 0 && <BaseHandle type="source" position={Position.Bottom} />}

      {/* Stacked card effect */}
      <div className="absolute inset-0 -z-10 translate-y-1 translate-x-1 bg-black/20 rounded-md border border-white/5" />
    </div>
  )
}