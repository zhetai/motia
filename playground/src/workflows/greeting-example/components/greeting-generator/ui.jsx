import React from 'react';

export default function GreetingGeneratorNode({ data }) {
  return (
    <div className="node-container">
      <p className="node-title">Greeting Generator</p>
      <p className="node-subtitle">Subscribes to: workflow.start</p>
      <p className="node-subtitle">Emits: greeting.generated ("hello")</p>
    </div>
  );
}
