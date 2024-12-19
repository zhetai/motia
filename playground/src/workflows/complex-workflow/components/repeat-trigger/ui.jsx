import React from 'react';
import { Handle, Position } from 'reactflow';

export default function RepeatTriggerNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <p className="node-title">Repeat Trigger</p>
      <p className="node-subtitle">Subscribes: workflow.done</p>
      <p className="node-subtitle">Emits: workflow.start</p>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}
