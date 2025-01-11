import { Position } from '@xyflow/react'
import { BaseHandle } from './base-handle'
import { BaseNodeProps } from './base-node-props'
import { Emits } from './emits'
import { Subscribe } from './subscribe'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

const baseNodeVariants = cva('p-2 px-3 flex flex-col max-w-[300px]', {
  variants: {
    variant: {
      ghost: '',
      white: 'bg-white text-black',
      noop: 'bg-lime-500 border-lime-950 border-solid border text-black p-2 px-4 text-black ',
    },
    shape: {
      noop: 'rounded-[20px]',
      rounded: 'rounded-md',
      square: 'rounded-none',
    },
  },
  defaultVariants: {
    variant: 'white',
    shape: 'rounded',
  },
})

type Props = PropsWithChildren<
  BaseNodeProps & {
    variant?: VariantProps<typeof baseNodeVariants>['variant']
    shape?: VariantProps<typeof baseNodeVariants>['shape']
    excludePubsub?: boolean
    className?: string
  }
>

export const BaseNode = (props: Props) => {
  const { data, variant, shape, excludePubsub, className } = props

  return (
    <div className={cn(baseNodeVariants({ variant, shape }), className)}>
      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold">{data.name}</div>
        {data.description && <div className="text-xs">{data.description}</div>}
      </div>
      {props.children}
      {!excludePubsub && (
        <div className="flex flex-col mt-2">
          <Subscribe data={data} />
          <Emits data={data} />
        </div>
      )}
      <BaseHandle type="target" position={Position.Top} />
      {data.emits.length > 0 && <BaseHandle type="source" position={Position.Bottom} />}
    </div>
  )
}
