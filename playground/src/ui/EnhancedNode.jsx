import React from 'react';
import { Handle, Position } from 'reactflow';

export default function EnhancedNode({ data }) {
  const getNodeColor = (type) => {
    const colors = {
      generator: '#4f46e5',    // Indigo
      transformer: '#0891b2',  // Cyan
      logger: '#059669',       // Emerald
      default: '#6366f1'       // Violet
    };

    const lowerType = (type || '').toLowerCase();
    if (lowerType.includes('generator')) return colors.generator;
    if (lowerType.includes('transform')) return colors.transformer;
    if (lowerType.includes('logger')) return colors.logger;
    return colors.default;
  };

  const nodeColor = getNodeColor(data.label);

  const containerStyle = {
    position: 'relative',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    border: '1px solid #444',
    backgroundColor: '#2c2c2c',
    padding: '12px 16px',
    minWidth: '200px',
    color: '#eee',
    borderLeft: `4px solid ${nodeColor}`,
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px'
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
    marginBottom: '4px'
  };

  const subtitleStyle = {
    fontSize: '13px',
    color: '#ccc',
    margin: '2px 0'
  };

  const badgeStyle = {
    display: 'inline-block',
    padding: '2px 4px',
    borderRadius: '4px',
    backgroundColor: '#333',
    color: '#eee',
    fontSize: '12px',
    marginRight: '4px',
    marginBottom: '4px'
  };

  return (
    <div style={containerStyle}>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />

      <div style={{ marginBottom: '8px' }}>
        <h3 style={titleStyle}>{data.label}</h3>
        {data.subscribe?.length > 0 && (
          <div style={subtitleStyle}>
            <span style={{ fontWeight: '600' }}>Subscribes to:</span>
            <div style={{ marginTop: '4px' }}>
              {data.subscribe.map((event, idx) => (
                <span key={idx} style={badgeStyle}>{event}</span>
              ))}
            </div>
          </div>
        )}
        {data.emits?.length > 0 && (
          <div style={subtitleStyle}>
            <span style={{ fontWeight: '600' }}>Emits:</span>
            <div style={{ marginTop: '4px' }}>
              {data.emits.map((event, idx) => (
                <span key={idx} style={{ ...badgeStyle, backgroundColor: '#222' }}>{event}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
