import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Controls, 
  Background,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow';
import { MotiaUi, useMotiaFlow } from 'motia/ui';
import 'reactflow/dist/style.css';
import './motia-ui.js';
import './styles.css';

export default function App() {
  const { nodes: initialNodes, edges: initialEdges, loading, error } = useMotiaFlow();
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const nodeTypes = MotiaUi.getNodeTypes();

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  if (loading) return <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif', padding: '20px' }}>Loading workflows...</div>;
  if (error) return <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif', padding: '20px' }}>Error: {error}</div>;

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#121212'
    }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodesDraggable={true}
        style={{ backgroundColor: '#121212' }}
        defaultEdgeOptions={{ 
          style: { stroke: '#fff', strokeWidth: 2 },
          type: 'smoothstep'
        }}
      >
        <Background variant="lines" gap={20} size={1} color="#555" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
