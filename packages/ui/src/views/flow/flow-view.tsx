import { Background, BackgroundVariant, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { BaseEdge } from './base-edge'
import { ArrowHead } from './arrow-head'
import { useGetFlowState, FlowResponse } from './hooks/use-get-flow-state'
import { useCallback, useEffect, useState } from 'react'
import { NodeOrganizer } from './node-organizer'
import { FlowLoader } from './flow-loader'
import { useLogListener } from '@/hooks/use-log-listener'
import { LogConsole } from '@/components/log-console'

const edgeTypes = {
  base: BaseEdge,
}

type Props = {
  flow: FlowResponse
}

export const FlowView: React.FC<Props> = ({ flow }) => {
  const { nodes, edges, onNodesChange, onEdgesChange, nodeTypes } = useGetFlowState(flow)
  const [initialized, setInitialized] = useState(false)
  useLogListener()

  // necessary to remove blinking effect when flow is loaded before is organized
  useEffect(() => setInitialized(false), [flow])
  const onInitialized = useCallback(() => {
    setTimeout(() => setInitialized(true), 10)
  }, [])

  if (!nodeTypes) {
    return null
  }

  return (
    <div className="w-full h-full relative bg-black">
      {!initialized && <FlowLoader />}
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
