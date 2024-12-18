import React, { useState } from 'react';

export default function WorkflowStarterNode({ data }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleStart = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch('/api/greeting/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setMessage("Workflow started successfully!");
      } else {
        const err = await res.json();
        setMessage("Error starting greeting: " + err.error);
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="node-container">
      <p className="node-title">Workflow Starter</p>
      <p className="node-subtitle">Click the button to trigger workflow.start</p>
      <button onClick={handleStart} disabled={loading}>
        {loading ? "Starting..." : "Start Workflow"}
      </button>
      {message && <p style={{ marginTop: '8px', color: '#fff' }}>{message}</p>}
    </div>
  );
}
