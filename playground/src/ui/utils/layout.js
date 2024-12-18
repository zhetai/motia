import dagre from 'dagre';

export function layoutElements(nodes, edges) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Top-to-bottom layout
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 100 });

  // Assume each node ~200x50; adjust if needed
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: x - 100, // center based on width 200
        y: y - 25   // center based on height 50
      },
      draggable: false
    };
  });

  return { nodes: layoutedNodes, edges };
}
