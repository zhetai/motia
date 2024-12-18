import React from 'react';
import { Handle, Position } from 'reactflow';

export default function GreetingExclaimerNode({ data }) {
  return (
    <div className="node-container">
    <Handle type="target" position={Position.Left} style={{ background: "#555" }} />
    <Handle type="source" position={Position.Right} style={{ background: "#555" }} />
      <p className="node-title">Greeting Exclaimer</p>
      <p className="node-subtitle">Subscribes to: greeting.uppercased</p>
      <p className="node-subtitle">Emits: greeting.final (e.g. "HELLO!!!")</p>
    </div>
  );
}
