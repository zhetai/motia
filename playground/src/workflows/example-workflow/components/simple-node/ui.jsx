import React from 'react';
import { Handle, Position } from 'reactflow';

export default function SimpleNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <p className="node-title">Simple Node</p>
      <p className="node-subtitle">Subscribes: example.event</p>
      <p className="node-subtitle">Emits: example.response</p>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}
