import React from 'react';

export default function rulesRequesterrNode({ data }) {
  return (
    <div className="node-container">
      <p className="node-title">{data.label}</p>
      <p className="node-subtitle">Subscribes to: {data.subscribe.join(', ') || 'None'}</p>
      <p className="node-subtitle">Some Text</p>
    </div>
  );
}