import {
  Background,
  BackgroundVariant,
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
  NodeChange,
  OnNodesChange,
  ReactFlow,
} from '@xyflow/react'
import React, { useCallback, useMemo, useState } from 'react'
import { ArrowHead } from './arrow-head'
import { BaseEdge } from './base-edge'
import { FlowLoader } from './flow-loader'
import { EdgeData, NodeData } from './nodes/nodes.types'
import { FlowConfigResponse, FlowResponse, useGetFlowState } from './hooks/use-get-flow-state'
import { Legend } from './legend'
import { NodeOrganizer } from './node-organizer'

import '@xyflow/react/dist/style.css'

export type FlowNode = ReactFlowNode<NodeData>
export type FlowEdge = ReactFlowEdge<EdgeData>

const edgeTypes = {
  base: BaseEdge,
}

type Props = {
  flow: FlowResponse
  flowConfig: FlowConfigResponse
}

export const FlowView: React.FC<Props> = ({ flow, flowConfig }) => {
  const { nodes, edges, onNodesChange, onEdgesChange, nodeTypes } = useGetFlowState(flow, flowConfig)
  const [initialized, setInitialized] = useState(false)
  const [hoveredType, setHoveredType] = useState<string | null>(null)

  const onInitialized = useCallback(() => {
    setInitialized(true)
  }, [])

  const getClassName = useCallback(
    (nodeType?: string) => {
      if (!hoveredType) return ''

      if (nodeType) {
        return nodeType === hoveredType
          ? 'border border-border scale-[1.02] transition-all duration-300'
          : 'opacity-30 transition-all duration-300'
      }

      // If no nodeType is provided, this is an edge
      return 'opacity-30 transition-all duration-300'
    },
    [hoveredType],
  )

  const nodesWithHighlights = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        className: getClassName(node.data.type),
      })),
    [nodes, getClassName],
  )

  const edgesWithHighlights = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        className: getClassName(), // No argument means it's an edge
      })),
    [edges, getClassName],
  )

  const onNodesChangeHandler = useCallback<OnNodesChange<FlowNode>>(
    (changes: NodeChange<FlowNode>[]) => {
      onNodesChange(changes)
    },
    [onNodesChange],
  )

  if (!nodeTypes) {
    return null
  }

  return (
    <div className="w-full h-full relative bg-background">
      {!initialized && <FlowLoader />}
      <Legend onHover={setHoveredType} />
      <ReactFlow
        nodes={nodesWithHighlights}
        edges={edgesWithHighlights}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChange}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={50}
          size={2}
          className="[--xy-background-color-dots:theme(colors.muted.DEFAULT)] [--xy-background-color:theme(colors.background)]"
        />
        <NodeOrganizer onInitialized={onInitialized} />
        <svg className="[--arrow-color:theme(colors.muted.foreground)]">
          <defs>
            <ArrowHead id="arrowhead" />
          </defs>
        </svg>
      </ReactFlow>
    </div>
  )
}
