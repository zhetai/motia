import React, { useEffect, useState } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css';
import nodeTypes from './nodeTypes.js';

export default function App() {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    fetch('/api/workflows')
      .then(res => res.json())
      .then(data => setWorkflows(data.workflows));
  }, []);

  const workflow = workflows[0];
  const nodes = workflow ? workflow.components.map((comp, idx) => ({
    id: comp.id,
    type: comp.id,
    position: { x: idx * 200, y: 100 },
    data: { label: comp.id, subscribe: comp.subscribe }
  })) : [];

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow nodes={nodes} edges={[]} nodeTypes={nodeTypes} fitView>
      <Background 
        variant="lines" 
        gap={20} 
        size={1} 
        color="#555" // A medium gray on a dark background
      />
      <Controls />
      </ReactFlow>
    </div>
  );
}