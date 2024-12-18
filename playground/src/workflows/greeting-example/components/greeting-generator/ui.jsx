import React from 'react';
import { Handle, Position } from 'reactflow';

export default function GreetingGeneratorNode({ data }) {
  return (
    <div className="node-container">
    <Handle type="target" position={Position.Left} style={{ background: "#555" }} />
    <Handle type="source" position={Position.Right} style={{ background: "#555" }} />
      <p className="node-title">Greeting Generator</p>
      <p className="node-subtitle">Subscribes to: workflow.start</p>
      <p className="node-subtitle">Emits: greeting.generated ("hello")</p>
    </div>
  );
}
