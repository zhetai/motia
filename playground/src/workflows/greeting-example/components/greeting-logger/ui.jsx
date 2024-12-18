import React from 'react';

export default function GreetingLoggerNode({ data }) {
  return (
    <div className="node-container">
      <p className="node-title">Greeting Logger</p>
      <p className="node-subtitle">Subscribes to: greeting.final</p>
      <p className="node-subtitle">Logs the final message to the console</p>
    </div>
  );
}
