import React from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import { MotiaUi, useMotiaFlow } from 'motia/ui';
import 'reactflow/dist/style.css';
import './motia-ui.js';
import './styles.css';

export default function App() {
  const { nodes, edges, loading, error } = useMotiaFlow();
  const nodeTypes = MotiaUi.getNodeTypes();

  if (loading) return <div>Loading workflows...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background variant="lines" gap={20} size={1} color="#555" />
        <Controls />
      </ReactFlow>
    </div>
  );
}