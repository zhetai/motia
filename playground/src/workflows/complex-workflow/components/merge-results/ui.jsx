import React from 'react';
import { Handle, Position } from 'reactflow';

export default function MergeResultsNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <p className="node-title">Merge Results</p>
      <p className="node-subtitle">Subscribes: data.transformedA, data.transformedB</p>
      <p className="node-subtitle">Emits: data.merged</p>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}
