import React from 'react';
import { Handle, Position } from 'reactflow';

export default function EnhancedNode({ data }) {
  const containerStyle = {
    position: 'relative',
    borderRadius: '8px',
    backgroundColor: '#2a2a2a',
    padding: '12px 16px',
    minWidth: '200px',
    color: '#eee',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    // Add the border style to match Validate Data node
    border: '1px solid #444'
  };

  const handleStyle = {
    width: '8px',
    height: '8px',
    backgroundColor: '#555',
    border: '2px solid #333',
    borderRadius: '50%'
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px',
    textAlign: 'center'
  };

  const subtitleStyle = {
    fontSize: '13px',
    color: '#ccc',
    margin: '2px 0',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />

      <div style={titleStyle}>{data.label}</div>
      
      {data.subscribe?.length > 0 && (
        <div style={subtitleStyle}>
          <span>Subscribes: {data.subscribe.join(', ')}</span>
        </div>
      )}
      
      {data.emits?.length > 0 && (
        <div style={subtitleStyle}>
          <span>Emits: {data.emits.join(', ')}</span>
        </div>
      )}
    </div>
  );
}