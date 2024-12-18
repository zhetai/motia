import React from 'react';

export default function GreetingUppercaseNode({ data }) {
  return (
    <div className="node-container">
      <p className="node-title">Greeting Uppercase</p>
      <p className="node-subtitle">Subscribes to: greeting.generated</p>
      <p className="node-subtitle">Emits: greeting.uppercased (e.g. "HELLO")</p>
    </div>
  );
}
