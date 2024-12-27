#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

// --------------- HELPER FUNCTIONS ---------------

async function extractMetadata(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  if (filePath.endsWith(".js")) {
    const metadataMatch = code.match(
      /export\s+const\s+metadata\s*=\s*({[\s\S]*?})/
    );
    const subscribeMatch = code.match(
      /export\s+const\s+subscribe\s*=\s*(\[[^\]]+\])/
    );
    const emitsMatch = code.match(/export\s+const\s+emits\s*=\s*(\[[^\]]+\])/);

    const metadata = metadataMatch
      ? Function(`return ${metadataMatch[1]}`)()
      : {};
    const subscribe = subscribeMatch
      ? Function(`return ${subscribeMatch[1]}`)()
      : [];
    const emits = emitsMatch ? Function(`return ${emitsMatch[1]}`)() : [];
    return { ...metadata, subscribe, emits };
  } else if (filePath.endsWith(".py")) {
    // naive replace of ' to " for JSON parse
    const code2 = code.replace(/'/g, '"');
    const metadataMatch = code2.match(/metadata\s*=\s*({[\s\S]*?})/);
    const subscribeMatch = code2.match(/subscribe\s*=\s*(\[[^\]]+\])/);
    const emitsMatch = code2.match(/emits\s*=\s*(\[[^\]]+\])/);

    return {
      ...(metadataMatch ? JSON.parse(metadataMatch[1]) : {}),
      subscribe: subscribeMatch ? JSON.parse(subscribeMatch[1]) : [],
      emits: emitsMatch ? JSON.parse(emitsMatch[1]) : [],
    };
  }
  // Unsupported file type
  return {};
}

async function findAllComponents(workflowDir, absoluteBase) {
  const componentsFolder = path.join(workflowDir, "components");
  if (!fs.existsSync(componentsFolder)) return [];

  const components = [];
  const dirs = fs.readdirSync(componentsFolder, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;

    const jsPath = path.join(componentsFolder, dir.name, "index.js");
    const pyPath = path.join(componentsFolder, dir.name, "index.py");

    let filePath = null;
    let metadata = null;

    if (fs.existsSync(jsPath)) {
      filePath = jsPath;
      metadata = await extractMetadata(jsPath);
    } else if (fs.existsSync(pyPath)) {
      filePath = pyPath;
      metadata = await extractMetadata(pyPath);
    } else {
      continue; // no recognized file
    }

    const componentId = dir.name;
    const agent = metadata.agent || metadata.metadata?.agent || "node-agent";

    components.push({
      id: componentId,
      agent,
      subscribe: metadata.subscribe || [],
      emits: metadata.emits || [],
      // Make the path relative to the base dir, NOT process.cwd()
      codePath: path.relative(absoluteBase, filePath),
    });
  }
  return components;
}

async function findAllWorkflows(baseDir, absoluteBase) {
  const workflowsDir = path.join(baseDir, "src", "workflows");
  if (!fs.existsSync(workflowsDir)) return [];

  const entries = fs.readdirSync(workflowsDir, { withFileTypes: true });
  const workflows = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const workflowName = entry.name;
    const workflowPath = path.join(workflowsDir, workflowName);

    // Optionally skip if missing config.js or version.json
    const files = fs.readdirSync(workflowPath);
    if (!files.includes("config.js") || !files.includes("version.json")) {
      continue;
    }

    const components = await findAllComponents(workflowPath, absoluteBase);
    workflows.push({
      name: workflowName,
      components,
    });
  }
  return workflows;
}

async function findAllTraffic(baseDir, absoluteBase) {
  const trafficDir = path.join(baseDir, "src", "traffic", "inbound");
  if (!fs.existsSync(trafficDir)) return [];

  const routeDefs = [];
  const files = fs.readdirSync(trafficDir);

  for (const file of files) {
    if (!file.endsWith(".js")) continue; // or .ts, etc.
    const fullPath = path.join(trafficDir, file);

    // 1) Dynamically import the module
    const mod = await import(pathToFileURL(fullPath));

    // 2) Extract path, method, and transform
    const routePath = mod.path || "/unknown";
    const routeMethod = mod.method || "GET";
    const transformFn = mod.default; // the transform function

    // 3) Build a config entry referencing only transformPath
    //    Because WistroServer will re-import the file at runtime and call the default export.
    routeDefs.push({
      path: routePath,
      method: routeMethod,
      transformPath: path.relative(absoluteBase, fullPath),
      // Could also do authorizePath if you want
    });
  }
  return routeDefs;
}

// --------------- CORE BUILDER LOGIC ---------------
async function buildWistroConfig(baseDir, configFilename) {
  const configPath = path.join(baseDir, configFilename);
  if (!fs.existsSync(configPath)) {
    throw new Error(`No config file found at: ${configPath}`);
  }

  // Read existing config
  const raw = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(raw);

  // Scan for workflows & traffic
  const workflows = await findAllWorkflows(baseDir, baseDir);
  const traffic = await findAllTraffic(baseDir, baseDir);

  // Merge them in
  config.workflows = workflows;
  config.traffic = traffic;

  // Write final output
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
  console.log(`[WistroConfigBuilder] Updated ${configFilename} in ${baseDir}`);
}

// --------------- CLI WRAPPER ---------------
async function main() {
  // Usage: node WistroConfigBuilder.js <baseDir> <configFilename>
  // e.g. node WistroConfigBuilder.js playground wistro.config.json
  const baseDir = process.argv[2] || "playground"; // folder to scan
  const configFilename = process.argv[3] || "wistro.config.json"; // config file name

  // Make an absolute path to baseDir, but we use baseDir itself for relative references
  const absoluteBase = path.resolve(process.cwd(), baseDir);

  await buildWistroConfig(absoluteBase, configFilename);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("Error building config:", err);
    process.exit(1);
  });
}
