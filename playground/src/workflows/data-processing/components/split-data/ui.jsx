import React from 'react';
import { Handle, Position } from 'reactflow';

export default function SplitDataNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} id="a" />
      <Handle type="source" position={Position.Right} style={{ top: '60%' }} id="b" />
      <p className="node-title">Split Data</p>
      <p className="node-subtitle">Subscribes: data.validated</p>
      <p className="node-subtitle">Emits: data.split.partA, data.split.partB</p>
    </div>
  );
}
