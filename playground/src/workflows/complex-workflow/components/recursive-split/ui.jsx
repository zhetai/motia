import React from 'react';
import { Handle, Position } from 'reactflow';

export default function RecursiveSplitNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <p className="node-title">Recursive Split</p>
      <p className="node-subtitle">Subscribes: workflow.start</p>
      <p className="node-subtitle">Emits: data.partA, data.partB, workflow.start (conditional)</p>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}
