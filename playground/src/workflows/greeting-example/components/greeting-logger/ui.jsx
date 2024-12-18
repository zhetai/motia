import React from 'react';
import { Handle, Position } from 'reactflow';

export default function GreetingLoggerNode({ data }) {
  return (
    <div className="node-container">
    <Handle type="target" position={Position.Left} style={{ background: "#555" }} />
    <Handle type="source" position={Position.Right} style={{ background: "#555" }} />
      <p className="node-title">Greeting Logger</p>
      <p className="node-subtitle">Subscribes to: greeting.final</p>
      <p className="node-subtitle">Logs the final message to the console</p>
    </div>
  );
}
