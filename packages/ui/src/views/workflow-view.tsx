import { Background, BackgroundVariant, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { BaseNode } from './nodes/BaseNode'
import { TriggerNode } from './nodes/TriggerNode'
import { BaseEdge } from './BaseEdge'
import { ArrowHead } from './ArrowHead'
import { useGetWorkflowState } from './hooks/use-get-workflow-state'
import { NodeOrganizer } from './NodeOrganizer'

const nodeTypes = {
  base: BaseNode,
  trigger: TriggerNode,
}

const edgeTypes = {
  base: BaseEdge,
}

export const WorkflowView = () => {
  const { nodes, edges, onNodesChange, onEdgesChange } = useGetWorkflowState('customer')

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#444" />
        <NodeOrganizer />

        <svg>
          <defs>
            <ArrowHead color="#B3B3B3" id="arrowhead" />
          </defs>
        </svg>
      </ReactFlow>
    </div>
  )
}
