import React from 'react';

export default function PolicyFixerNode({ data }) {
  return (
    <div className="node-container">
      <p className="node-title">{data.label || "Policy Fixer"}</p>
      <p className="node-subtitle">Subscribes to: {data.subscribe?.join(', ') || 'None'}</p>
      <p className="node-subtitle">Automatically generates suggested policy updates</p>
    </div>
  );
}