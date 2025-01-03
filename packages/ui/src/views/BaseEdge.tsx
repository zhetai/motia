import { BaseEdge as BaseReactFlowEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from '@xyflow/react'
import { cva } from 'class-variance-authority'
import React from 'react'
import { cn } from '@/lib/utils'
import { EdgeData } from './nodes/nodes.types'

const getPath = (props: EdgeProps) => {
  const sourceSide = props.sourcePosition === 'left' || props.sourcePosition === 'right'
  const sourceX =
    props.sourcePosition === 'right'
      ? props.sourceX - 6
      : props.sourcePosition === 'left'
        ? props.sourceX + 6
        : props.sourceX

  const sourceY = props.sourcePosition === 'bottom' ? props.sourceY - 3 : props.sourceY
  const targetX = props.targetPosition === 'left' ? props.targetX + 4 : props.targetX
  const targetY = props.targetPosition === 'top' ? props.targetY + 4 : props.targetY

  const pathConfig = {
    borderRadius: 10,
    offset: sourceSide ? 20 : 10,
    sourceX,
    sourceY,
    sourcePosition: props.sourcePosition,
    targetX,
    targetY,
    targetPosition: props.targetPosition,
  }

  return getSmoothStepPath(pathConfig)
}

const labelVariants = cva('absolute pointer-events-all text-cs border p-1 px-2', {
  variants: {
    color: {
      default: 'border-[#b3b3b3] bg-black text-gray-100 font-semibold border-solid rounded-full',
      conditional: 'bg-amber-300 border-amber-950 text-amber-950 border-solid font-semibold italic rounded-lg',
    },
  },
  defaultVariants: {
    color: 'default',
  },
})

export const BaseEdge: React.FC<EdgeProps> = (props: EdgeProps) => {
  const { label, selected } = props
  const color = selected ? '#fff' : '#b3b3b3'
  const style = { strokeWidth: 2, stroke: color }
  const [edgePath, labelX, labelY] = getPath(props)
  const data = props.data as EdgeData | undefined

  return (
    <>
      <BaseReactFlowEdge path={edgePath} style={style} markerEnd="url(#arrowhead)" />
      {label && (
        <EdgeLabelRenderer>
          <div
            className={cn(labelVariants({ color: data?.variant }))}
            style={{ transform: `translateX(-50%) translateY(-50%) translate(${labelX}px, ${labelY}px)` }}
          >
            <div className="text-xs font-mono">{label}</div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
