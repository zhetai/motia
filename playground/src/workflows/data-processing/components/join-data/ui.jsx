import React from 'react';
import { Handle, Position } from 'reactflow';

export default function JoinDataNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <p className="node-title">Join Data</p>
      <p className="node-subtitle">Subscribes: data.transformed.partA, data.transformed.partB</p>
      <p className="node-subtitle">Emits: data.joined</p>
    </div>
  );
}
