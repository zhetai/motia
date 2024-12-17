#!/usr/bin/env node
import fs from "fs";
import path from "path";

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "create" && args[1] === "component") {
    const workflowName = args[2];
    const componentName = args[3];

    if (!workflowName || !componentName) {
      console.error(
        "Usage: npx motia-cli create component <workflowName> <componentName>"
      );
      process.exit(1);
    }

    const componentDir = path.join(
      process.cwd(),
      "src",
      "workflows",
      workflowName,
      "components",
      componentName
    );

    if (fs.existsSync(componentDir)) {
      console.error(`Component directory already exists: ${componentDir}`);
      process.exit(1);
    }

    await fs.promises.mkdir(componentDir, { recursive: true });

    const safeHandlerName = toCamelCase(componentName) + "Handler";
    const safeComponentName = toPascalCase(componentName) + "Node";

    const indexJsPath = path.join(componentDir, "index.js");
    const uiJsxPath = path.join(componentDir, "ui.jsx");

    const indexJsContent = `// index.js boilerplate
export const subscribe = ["example.my-event"];

export default async function ${safeHandlerName}(input, emit, eventType) {
  // Add your logic here
  console.log("Received event:", eventType, input);
}
`;

    const uiJsxContent = `// ui.jsx boilerplate
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

    await fs.promises.writeFile(indexJsPath, indexJsContent, "utf8");
    await fs.promises.writeFile(uiJsxPath, uiJsxContent, "utf8");

    console.log(
      `Component ${componentName} created successfully at ${componentDir}`
    );
    console.log(
      "You can now add your logic and it will be rendered automatically by the Motia UI."
    );
  } else {
    console.error(
      "Unknown command. Usage: npx motia-cli create component <workflowName> <componentName>"
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
