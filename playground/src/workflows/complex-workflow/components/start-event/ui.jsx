import React from 'react';
import { Handle, Position } from 'reactflow';

export default function StartEventNode() {
  return (
    <div className="node-container">
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
      <p className="node-title">Start Event</p>
      <p className="node-subtitle">Emits: workflow.start</p>
    </div>
  );
}
