import React from 'react';
import { Handle, Position } from 'reactflow';

export default function SaveDataNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Left} />
      <p className="node-title">Save Data</p>
      <p className="node-subtitle">Subscribes: data.joined</p>
      <p className="node-subtitle">Emits: data.saved</p>
    </div>
  );
}
