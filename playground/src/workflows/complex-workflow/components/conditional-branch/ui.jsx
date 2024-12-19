import React from 'react';
import { Handle, Position } from 'reactflow';

export default function ConditionalBranchNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <p className="node-title">Conditional Branch</p>
      <p className="node-subtitle">Subscribes: data.merged</p>
      <p className="node-subtitle">Emits: workflow.finalize or workflow.start</p>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}
