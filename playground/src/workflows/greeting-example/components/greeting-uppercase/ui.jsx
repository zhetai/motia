import React from 'react';
import { Handle, Position } from 'reactflow';

export default function GreetingUppercaseNode({ data }) {
  return (
    <div className="node-container">
    <Handle type="target" position={Position.Left} style={{ background: "#555" }} />
    <Handle type="source" position={Position.Right} style={{ background: "#555" }} />
      <p className="node-title">Greeting Uppercase</p>
      <p className="node-subtitle">Subscribes to: greeting.generated</p>
      <p className="node-subtitle">Emits: greeting.uppercased (e.g. "HELLO")</p>
    </div>
  );
}
