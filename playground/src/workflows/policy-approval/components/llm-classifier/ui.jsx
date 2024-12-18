import React, { useState } from 'react';

export default function LlmClassifierNode({ data }) {
  const subscribedEvents = data.subscribe.join(', ') || 'None';

  const [prompt, setPrompt] = useState(`
Given these policy rules:
{{rules}}

And this new policy document:
{{document}}

1) Determine compliance...
2) Provide recommendations...
`.trim());

  const [testDocContent, setTestDocContent] = useState("This is a sample doc content that needs testing.");

  const handleTestClassification = async () => {
    console.log(testDocContent)
    const response = await fetch('/api/simulateClassification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testDocContent })
    });

    if (response.ok) {
      alert("Simulated classification event with your test doc content. Check logs or downstream output for results.");
    } else {
      const err = await response.json();
      alert("Classification simulation failed: " + err.error);
    }
  };

  return (
    <div className="node-container">
      <p className="node-title">{data.label}</p>
      <p className="node-subtitle">Subscribes to: {subscribedEvents}</p>

      <h4 style={{ marginTop: '16px', fontWeight: '600' }}>LLM Prompt Configuration</h4>
      <p style={{ margin: '4px 0' }}>Edit the prompt template used by the classifier:</p>
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        style={{ width: '100%', height: '150px', marginBottom: '8px' }} 
      />

      <h4 style={{ marginTop: '16px', fontWeight: '600' }}>Test Classification</h4>
      <p style={{ margin: '4px 0' }}>Enter test document content:</p>
      <textarea 
        value={testDocContent} 
        onChange={(e) => setTestDocContent(e.target.value)} 
        style={{ width: '100%', height: '100px', marginBottom: '8px' }} 
      />

      <button onClick={handleTestClassification} style={{ padding: '8px 12px', cursor: 'pointer' }}>
        Run Test Classification
      </button>
    </div>
  );
}
