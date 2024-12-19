import React from 'react';
import { Handle, Position } from 'reactflow';

export default function TransformPartANode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <p className="node-title">Transform Part A</p>
      <p className="node-subtitle">Subscribes: data.split.partA</p>
      <p className="node-subtitle">Emits: data.transformed.partA</p>
    </div>
  );
}
