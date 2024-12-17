import React, { useState } from 'react';

export default function DocUploadTriggerNode({ data }) {
  const subscribedEvents = data.subscribe.join(', ') || 'None';

  const [fileId, setFileId] = useState("SAMPLE_FILE_ID");
  const [fileName, setFileName] = useState("Sample Document");

  const handleSimulateUpload = async () => {
    const response = await fetch('/api/docs/uploaded', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, fileName })
    });

    if (response.ok) {
      alert(`Simulated doc.uploaded event for ${fileName} (${fileId})`);
    } else {
      const err = await response.json();
      alert("Simulation failed: " + err.error);
    }
  };

  return (
    <div className="node-container">
      <p className="node-title">{data.label}</p>
      <p className="node-subtitle">Subscribes to: {subscribedEvents}</p>
      
      <h4 style={{ marginTop: '16px', fontWeight: '600' }}>Test the Initial Trigger</h4>
      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>File ID:</label>
        <input 
          type="text"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>File Name:</label>
        <input 
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <button onClick={handleSimulateUpload} style={{ padding: '8px 12px', cursor: 'pointer' }}>
        Simulate Doc Upload
      </button>
    </div>
  );
}
