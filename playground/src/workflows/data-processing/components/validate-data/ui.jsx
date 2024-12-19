import React from 'react';
import { Handle, Position } from 'reactflow';

export default function ValidateDataNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <p className="node-title">Validate Data</p>
      <p className="node-subtitle">Subscribes: data.uploaded</p>
      <p className="node-subtitle">Emits: data.validated</p>
    </div>
  );
}
