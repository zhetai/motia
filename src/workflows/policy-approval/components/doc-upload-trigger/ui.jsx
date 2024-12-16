import React from 'react';

export default function DocUploadTriggerNode({ data }) {
  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
      <strong>{data.label}</strong>
      <p>Subscribes to: {data.subscribe.join(', ')}</p>
    </div>
  );
}