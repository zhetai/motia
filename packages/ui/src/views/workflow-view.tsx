import { Background, BackgroundVariant, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { BaseNode } from './nodes/BaseNode'
import { TriggerNode } from './nodes/TriggerNode'
import { BaseEdge } from './BaseEdge'
import { ArrowHead } from './ArrowHead'
import { initialEdges, initialNodes } from './mock-flow'

const nodeTypes = {
  base: BaseNode,
  trigger: TriggerNode,
}

const edgeTypes = {
  base: BaseEdge,
}

export const WorkflowView = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#444" />

        <svg>
          <defs>
            <ArrowHead color="#B3B3B3" id="arrowhead" />
          </defs>
        </svg>
      </ReactFlow>
    </div>
  )
}
