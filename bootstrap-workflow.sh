#!/usr/bin/env bash
set -e

echo "Creating inbound traffic trigger for workflow start..."
mkdir -p playground/src/traffic/inbound
cat > playground/src/traffic/inbound/workflow-start.js <<EOF
import { defineTraffic } from "motia";

export default defineTraffic({
  path: "/api/workflow/start",
  method: "POST",
  transform: (req) => {
    return {
      type: "workflow.start",
      data: {}
    };
  }
});
EOF

echo "Creating workflow-starter component..."
mkdir -p playground/src/workflows/greeting-example/components/workflow-starter
cat > playground/src/workflows/greeting-example/components/workflow-starter/index.js <<EOF
// This component does not subscribe or emit any events.
// It's just a placeholder so the Motia UI can render it.
EOF

cat > playground/src/workflows/greeting-example/components/workflow-starter/ui.jsx <<EOF
import React, { useState } from 'react';

export default function WorkflowStarterNode({ data }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleStart = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch('/api/workflow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setMessage("Workflow started successfully!");
      } else {
        const err = await res.json();
        setMessage("Error starting workflow: " + err.error);
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
EOF

echo "Setup complete!"
echo "You can now run the application and use the Workflow Starter button in the UI to trigger the workflow."
