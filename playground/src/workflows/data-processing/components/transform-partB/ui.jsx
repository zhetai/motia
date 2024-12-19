import React from 'react';
import { Handle, Position } from 'reactflow';

export default function TransformPartBNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <p className="node-title">Transform Part B</p>
      <p className="node-subtitle">Subscribes: data.split.partB</p>
      <p className="node-subtitle">Emits: data.transformed.partB</p>
    </div>
  );
}
