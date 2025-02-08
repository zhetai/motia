import React, { useCallback, useEffect, useState } from 'react'
import { Background, BackgroundVariant, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { BaseEdge } from './base-edge'
import { ArrowHead } from './arrow-head'
import { useGetFlowState, FlowResponse } from './hooks/use-get-flow-state'
import { NodeOrganizer } from './node-organizer'
import { FlowLoader } from './flow-loader'
import { LogConsole } from '@/components/log-console'
import { Legend } from './legend'

const edgeTypes = {
  base: BaseEdge,
}

type Props = {
  flow: FlowResponse
}

export const FlowView: React.FC<Props> = ({ flow }) => {
  const { nodes, edges, onNodesChange, onEdgesChange, nodeTypes } = useGetFlowState(flow)
  const [initialized, setInitialized] = useState(false)
  const [hoveredType, setHoveredType] = useState<string | null>(null)

  useEffect(() => setInitialized(false), [flow])
  const onInitialized = useCallback(() => {
    setTimeout(() => setInitialized(true), 10)
  }, [])

  const getClassName = (nodeType?: string) => {
    if (!hoveredType) return ''

    if (nodeType) {
      return nodeType === hoveredType
        ? 'shadow-[0_0_15px_rgba(255,255,255,0.15)] border border-white/30 scale-[1.02] transition-all duration-300'
        : 'opacity-30 transition-all duration-300'
    }

    // If no nodeType is provided, this is an edge
    return 'opacity-30 transition-all duration-300'
  }

  const nodesWithHighlights = nodes.map((node) => ({
    ...node,
    className: getClassName(node.data.type),
  }))

  const edgesWithHighlights = edges.map((edge) => ({
    ...edge,
    className: getClassName(), // No argument means it's an edge
  }))

  if (!nodeTypes) {
    return null
  }

  return (
    <div className="w-full h-full relative bg-black">
      {!initialized && <FlowLoader />}
      <Legend onHover={setHoveredType} />
      <ReactFlow
        nodes={nodesWithHighlights}
        edges={edgesWithHighlights}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#444" />
        <NodeOrganizer onInitialized={onInitialized} />
        <svg>
          <defs>
            <ArrowHead color="#B3B3B3" id="arrowhead" />
          </defs>
        </svg>
      </ReactFlow>
      <LogConsole />
    </div>
  )
}
