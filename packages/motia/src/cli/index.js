#!/usr/bin/env node
import { createComponent } from "./commands/createComponent.js";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "create" && args[1] === "component") {
    const workflowName = args[2];
    const componentName = args[3];

    try {
      const componentDir = await createComponent(workflowName, componentName);
      console.log(
        `Component ${componentName} created successfully at ${componentDir}`
      );
      console.log(
        "You can now add your logic and it will be rendered automatically by the Motia UI."
      );
    } catch (err) {
      console.error("Error:", err.message);
      process.exit(1);
    }
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
