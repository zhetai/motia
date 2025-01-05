import { Background, BackgroundVariant, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { BaseNode } from './nodes/base-node'
import { TriggerNode } from './nodes/trigger-node'
import { BaseEdge } from './base-edge'
import { ArrowHead } from './arrow-head'
import { useGetWorkflowState, WorkflowResponse } from './hooks/use-get-workflow-state'
import { useCallback, useEffect, useState } from 'react'
import { NodeOrganizer } from './node-organizer'
import { WorkflowLoader } from './workflow-loader'
import { NoopNode } from './nodes/noop-node'
import { useLogListener } from '@/hooks/use-log-listener'
import { LogConsole } from '@/components/log-console'

const nodeTypes = {
  base: BaseNode,
  trigger: TriggerNode,
  noop: NoopNode,
}

const edgeTypes = {
  base: BaseEdge,
}

type Props = {
  workflow: WorkflowResponse
}

export const WorkflowView: React.FC<Props> = ({ workflow }) => {
  const { nodes, edges, onNodesChange, onEdgesChange } = useGetWorkflowState(workflow)
  const [initialized, setInitialized] = useState(false)
  useLogListener()

  // necessary to remove blinking effect when workflow is loaded before is organized
  useEffect(() => setInitialized(false), [workflow])
  const onInitialized = useCallback(() => {
    setTimeout(() => setInitialized(true), 10)
  }, [])

  return (
    <div className="w-full h-full relative">
      {!initialized && <WorkflowLoader />}
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
