export function createIndexJs(componentName) {
  const safeHandlerName = toCamelCase(componentName) + "Handler";

  return `// index.js boilerplate
  export const subscribe = ["example.my-event"];
  
  export default async function ${safeHandlerName}(input, emit, eventType) {
    // Add your logic here
    console.log("Received event:", eventType, input);
  }
  `;
}

export function createUiJsx(componentName) {
  const safeComponentName = toPascalCase(componentName) + "Node";

  return `// ui.jsx boilerplate
  import React from 'react';
  
  export default function ${safeComponentName}({ data }) {
    return (
      <div className="node-container">
        <p className="node-title">{data.label || "${toPascalCase(
          componentName
        )}"}</p>
        <p className="node-subtitle">Subscribed to: {data.subscribe?.join(", ")}</p>
      </div>
    );
  }
  `;
}
