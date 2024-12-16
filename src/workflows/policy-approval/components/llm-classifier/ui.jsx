export default function LlmClassifierNode({ data }) {
  console.log("Rendering llm-classifier node");
  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
      <strong>{data.label}</strong>
      <p>Subscribes to: {data.subscribe.join(', ')}</p>
      <p>Some Text</p>
    </div>
  );
}
