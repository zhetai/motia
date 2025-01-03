import { Edge, Node } from '@xyflow/react'
import dagre from 'dagre'
import { useEffect } from 'react'

export const useOrganizeNodes = (nodes: Node[], edges: Edge[], onNodesChange: (nodes: Node[]) => void) => {
  useEffect(() => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    // Top-to-bottom layout
    dagreGraph.setGraph({ rankdir: 'TB', ranksep: 200, nodesep: 200 })

    // Assume each node ~200x50; adjust if needed
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 300, height: 80 })
    })

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target, { label: edge.label ?? '' })
    })

    dagre.layout(dagreGraph)

    const layoutedNodes = nodes.map((node) => {
      const { x, y } = dagreGraph.node(node.id)
      return {
        ...node,
        position: {
          x: x - 100, // center based on width 200
          y: y - 25, // center based on height 50
        },
        draggable: false,
      }
    })

    onNodesChange(layoutedNodes)
  }, [nodes, edges])
}
