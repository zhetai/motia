import { useGetWorkflow } from '@/hooks/use-get-workflow'
import { Edge, Node, useEdgesState, useNodesState } from '@xyflow/react'
import { useEffect } from 'react'
import { BaseNodeData, EdgeData, TriggerNodeData } from '../nodes/nodes.types'

export const useGetWorkflowState = (id?: string) => {
  const { workflow } = useGetWorkflow(id)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<BaseNodeData | TriggerNodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([])

  useEffect(() => {
    if (!workflow) return

    // we need to check all subscribes and emits to connect the nodes using edges
    const nodes: Node<BaseNodeData | TriggerNodeData>[] = workflow.steps.map((step) => ({
      id: step.id,
      type: step.type,
      position: { x: 0, y: 0 },
      data: step as BaseNodeData | TriggerNodeData,
    }))

    const edges: Edge<EdgeData>[] = []

    // For each node that emits events
    workflow.steps.forEach((sourceNode) => {
      const emits = sourceNode.emits || []

      // Check all other nodes that subscribe to those events
      workflow.steps.forEach((targetNode) => {
        const subscribes = targetNode.subscribes || []

        // For each matching emit->subscribe, create an edge
        emits.forEach((emit) => {
          const emitType = typeof emit === 'string' ? emit : emit.type

          if (subscribes.includes(emitType)) {
            edges.push({
              id: `${sourceNode.id}-${targetNode.id}`,
              type: 'base',
              source: sourceNode.id,
              target: targetNode.id,
              label: typeof emit !== 'string' ? emit.label : undefined,
            })
          }
        })
      })
    })

    setNodes(nodes)
    setEdges(edges)
  }, [workflow])

  return { nodes, edges, onNodesChange, onEdgesChange }
}
