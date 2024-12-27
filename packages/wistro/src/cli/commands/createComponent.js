// packages/wistro/src/cli/commands/createComponent.js
import fs from "fs";
import path from "path";
import { createIndexJs, createUiJsx } from "../templates.js";

export async function createComponent(workflowName, componentName) {
  if (!workflowName || !componentName) {
    throw new Error(
      "Usage: npx wistro-cli create component <workflowName> <componentName>"
    );
  }

  const componentDir = path.join(
    process.cwd(),
    "playground", // Add playground to the path
    "src",
    "workflows",
    workflowName,
    "components",
    componentName
  );

  if (fs.existsSync(componentDir)) {
    throw new Error(`Component directory already exists: ${componentDir}`);
  }

  await fs.promises.mkdir(componentDir, { recursive: true });

  const indexJsPath = path.join(componentDir, "index.js");
  const uiJsxPath = path.join(componentDir, "ui.jsx");

  await fs.promises.writeFile(
    indexJsPath,
    createIndexJs(componentName),
    "utf8"
  );
  await fs.promises.writeFile(uiJsxPath, createUiJsx(componentName), "utf8");

  return componentDir;
}
