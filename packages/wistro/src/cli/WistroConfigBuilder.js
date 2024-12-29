#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

// --------------- HELPER FUNCTIONS ---------------

async function extractMetadata(filePath) {
  const code = fs.readFileSync(filePath, "utf8");

  // JS vs. Python logic, etc.
  if (filePath.endsWith(".js")) {
    // 1) Find `export const config = {...}`
    const configMatch = code.match(
      /export\s+const\s+config\s*=\s*({[\s\S]*?})/
    );
    let configObject = {};

    if (configMatch) {
      try {
        // Safely parse the object
        configObject = Function(`return ${configMatch[1]}`)() || {};
      } catch (err) {
        console.error("Error parsing JS config object:", err);
      }
    }

    // 2) Extract `configObject.subscribe || subscribes` and `configObject.emits`
    const subscribeFromConf =
      configObject.subscribe || configObject.subscribes || [];
    const emitsFromConf = configObject.emits || [];

    // 3) Also check if user still has old `export const subscribe = [...]` lines
    const subscribeMatch = code.match(
      /export\s+const\s+subscribe\s*=\s*(\[[^\]]+\])/
    );
    const emitsMatch = code.match(/export\s+const\s+emits\s*=\s*(\[[^\]]+\])/);

    let fallbackSubscribe = subscribeMatch
      ? Function(`return ${subscribeMatch[1]}`)()
      : [];
    let fallbackEmits = emitsMatch ? Function(`return ${emitsMatch[1]}`)() : [];

    // 4) Final arrays prefer the new config fields
    const finalSubscribes = subscribeFromConf.length
      ? subscribeFromConf
      : fallbackSubscribe;
    const finalEmits = emitsFromConf.length ? emitsFromConf : fallbackEmits;

    // 5) Return combined result with agent, subscribes/emits, etc.
    return {
      ...configObject,
      subscribe: finalSubscribes,
      emits: finalEmits,
    };
  } else if (filePath.endsWith(".py")) {
    // 1) Convert single quotes to double for naive JSON parse
    const code2 = code.replace(/'/g, '"');

    // 2) Find the config block
    // e.g. `config = { "agent": "server", "subscribes": [...], "emits": [...] }`
    const configMatch = code2.match(/config\s*=\s*({[\s\S]*?})/);
    let configObj = {};

    if (configMatch) {
      try {
        // Attempt to parse as JSON
        configObj = JSON.parse(configMatch[1]);
      } catch (err) {
        console.error("Error parsing Python config block:", err);
      }
    }

    // 3) Extract subscribe / emits from configObj
    // Note: your user might name them `subscribes` or `subscribe`. Adjust as needed.
    const subscribe = configObj.subscribe || configObj.subscribes || [];
    const emits = configObj.emits || [];

    // Also handle agent or endpoint
    const agent = configObj.agent || configObj.endpoint || "server";

    // Return combined
    return {
      ...configObj,
      subscribe,
      emits,
      agent,
    };
  }

  // default
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
    const agent = metadata.agent || metadata.metadata?.agent || "server";

    components.push({
      id: componentId,
      agent,
      subscribe: metadata.subscribe || [],
      emits: metadata.emits || [],
      name: metadata.name || componentId,
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
    if (!files.includes("config.js")) {
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
  const trafficFile = path.join(baseDir, "src", "traffic", "index.js");
  if (!fs.existsSync(trafficFile)) return [];

  // Import it, read 'export const config = {...}' if that’s how your traffic is defined
  const mod = await import(pathToFileURL(trafficFile));
  // Then parse and push each route
  const trafficMap = mod.config || {};
  const routeDefs = Object.values(trafficMap).map((t) => ({
    // path, method, maybe transformPath or direct event
    path: t.path,
    method: t.method,
    type: t.type,
  }));

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
