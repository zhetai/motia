import { Background, BackgroundVariant, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { BaseNode } from './nodes/BaseNode'
import { TriggerNode } from './nodes/TriggerNode'
import { BaseEdge } from './BaseEdge'
import { ArrowHead } from './ArrowHead'
import { useGetWorkflowState } from './hooks/use-get-workflow-state'
import { NodeOrganizer } from './NodeOrganizer'
import { useSearch } from '@tanstack/react-router'

const nodeTypes = {
  base: BaseNode,
  trigger: TriggerNode,
}

const edgeTypes = {
  base: BaseEdge,
}

export const WorkflowView = () => {
  const workflowId = useSearch({from: '/', select: (search: {workflowId?: string}) => {
      if (search.workflowId && search.workflowId.length > 0) {
        return search.workflowId;
      }

      return undefined
  }});
  const { nodes, edges, onNodesChange, onEdgesChange } = useGetWorkflowState(workflowId)

  console.log("workflowId", workflowId, typeof workflowId)

  return (
    <div className="w-full h-full">
      {!workflowId && <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a workflow</p>
        </div>}
      {workflowId && <ReactFlow
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
      </ReactFlow>}
    </div>
  )
}
