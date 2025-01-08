import { Edge, Node, useEdgesState, useNodesState } from '@xyflow/react'
import { useEffect } from 'react'
import type { EdgeData, NodeData } from '../nodes/nodes.types'

type Emit = string | { type: string; label?: string; conditional?: boolean }

type FlowStep = {
  id: string
  name: string
  type: 'base' | 'trigger'
  description?: string
  subscribes?: string[]
  emits: Emit[]
  action?: 'webhook' | 'cron'
  webhookUrl?: string
  cron?: string
}

export type FlowResponse = {
  id: string
  name: string
  steps: FlowStep[]
}

export const useGetFlowState = (flow: FlowResponse) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([])

  useEffect(() => {
    if (!flow) return

    // we need to check all subscribes and emits to connect the nodes using edges
    const nodes: Node<NodeData>[] = flow.steps.map((step) => ({
      id: step.id,
      type: step.type,
      position: { x: 0, y: 0 },
      data: step,
    }))

    const edges: Edge<EdgeData>[] = []

    // For each node that emits events
    flow.steps.forEach((sourceNode) => {
      const emits = sourceNode.emits || []

      // Check all other nodes that subscribe to those events
      flow.steps.forEach((targetNode) => {
        const subscribes = targetNode.subscribes || []

        // For each matching emit->subscribe, create an edge
        emits.forEach((emit) => {
          const emitType = typeof emit === 'string' ? emit : emit.type

          if (subscribes.includes(emitType)) {
            const label = typeof emit !== 'string' ? emit.label : undefined
            const variant = typeof emit !== 'string' && emit.conditional ? 'conditional' : 'default'
            const data: EdgeData = { variant, label }

            edges.push({
              id: `${sourceNode.id}-${targetNode.id}`,
              type: 'base',
              source: sourceNode.id,
              target: targetNode.id,
              label,
              data,
            })
          }
        })
      })
    })

    setNodes(nodes)
    setEdges(edges)
  }, [flow])

  return { nodes, edges, onNodesChange, onEdgesChange }
}
