import React from 'react';
import { Handle, Position } from 'reactflow';

export default function TransformBNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <p className="node-title">Transform B</p>
      <p className="node-subtitle">Subscribes: data.partB</p>
      <p className="node-subtitle">Emits: data.transformedB</p>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}
