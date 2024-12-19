import React from 'react';
import { Handle, Position } from 'reactflow';

export default function FinalizeNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <p className="node-title">Finalize</p>
      <p className="node-subtitle">Subscribes: workflow.finalize</p>
      <p className="node-subtitle">Emits: workflow.done</p>
    </div>
  );
}
