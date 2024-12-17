// ui.jsx boilerplate
import React from 'react';

export default function PolicyUpdaterNode({ data }) {
  return (
    <div className="node-container">
      <p className="node-title">{data.label || "PolicyUpdater"}</p>
      <p className="node-subtitle">Subscribes to: {data.subscribe?.join(", ")}</p>
    </div>
  );
}
