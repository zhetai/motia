import React from 'react';
import { Handle, Position } from 'reactflow';

export default function SplitDataNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="a" />
      <p className="node-title">Split Data</p>
      <p className="node-subtitle">Subscribes: data.validated</p>
      <p className="node-subtitle">Emits: data.split.partA, data.split.partB</p>
    </div>
  );
}
