import React from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import { MotiaUi, useMotiaFlow } from 'motia/ui';
import 'reactflow/dist/style.css';
import './motia-ui.js';
import './styles.css';

export default function App() {
  const { nodes, edges, loading, error } = useMotiaFlow();
  const nodeTypes = MotiaUi.getNodeTypes();

  if (loading) return <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif', padding: '20px' }}>Loading workflows...</div>;
  if (error) return <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif', padding: '20px' }}>Error: {error}</div>;
  console.log('$$$$$$$$', nodes, edges, nodeTypes)
  return (
    <div style={
      { 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: 
        '#121212', 
        defalutEdgeStyle: { stroke: '#fff', strokeWidth: 2 }
      }
    }>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={nodeTypes} 
        fitView
        style={{ backgroundColor: '#121212' }}
      >
        <Background variant="lines" gap={20} size={1} color="#555" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
