import React from 'react';
import { Handle, Position } from 'reactflow';

export default function TransformANode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <p className="node-title">Transform A</p>
      <p className="node-subtitle">Subscribes: data.partA</p>
      <p className="node-subtitle">Emits: data.transformedA</p>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}
