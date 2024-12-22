// packages/motia/src/core/MotiaCore.js
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import { InMemoryMessageBus } from "./MessageBus.js";
import { AgentManager } from "./agents/AgentManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MotiaCore {
  constructor(options = {}) {
    this.messageBus = new InMemoryMessageBus();
    this.agentManager = null;
    this.workflows = new Map();
    this.components = new Map();
    this.logger = options.logger;
  }

  async initialize(options = {}) {
    const workflowPaths = options.workflowPaths || ["./src/workflows"];
    if (this.logger) {
      await this.logger.initialize();
    }

    // Initialize message bus first
    this.messageBus = options.messageBus || new InMemoryMessageBus();
    await this.messageBus.initialize();

    // Initialize agent manager if agents are configured
    if (options.agents) {
      this.agentManager = new AgentManager(this.messageBus);
      await this.agentManager.initialize();

      // Register configured agents
      for (const [name, config] of Object.entries(options.agents)) {
        await this.agentManager.registerAgent(name, config);
      }
    }

    this.workflows = new Map();
    this.components = new Map();

    // Convert workflowPaths to absolute
    const absoluteWorkflowPaths = workflowPaths.map((p) => path.resolve(p));

    // Load all workflows
    for (const wPath of absoluteWorkflowPaths) {
      const workflowFiles = await this.findWorkflowFiles(wPath);
      for (const file of workflowFiles) {
        await this.registerWorkflow(file);
      }
    }

    // Load all components
    const componentFiles = await this.findComponentFiles(absoluteWorkflowPaths);
    for (const file of componentFiles) {
      try {
        const fileExt = path.extname(file);
        // For JS files, we can get metadata directly
        if (fileExt === ".js") {
          const component = await import(file);
          if (component.metadata?.agent) {
            await this.agentManager.registerComponent(
              file,
              component.metadata.agent
            );
          } else {
            await this.registerComponent(file);
          }
        }
        // For Python files, parse metadata and register with agent
        else if (fileExt === ".py") {
          const code = await fs.promises.readFile(file, "utf-8");
          const metadataMatch = code.match(/metadata\s*=\s*({[\s\S]*?})/);
          if (metadataMatch) {
            const metadata = JSON.parse(metadataMatch[1].replace(/'/g, '"'));
            if (metadata.agent) {
              await this.agentManager.registerComponent(file, metadata.agent);
            }
          } else {
            console.warn(`No metadata found in Python component: ${file}`);
          }
        }
      } catch (error) {
        console.error(`Error loading component ${file}:`, error);
        console.error(error.stack); // Add stack trace for better debugging
      }
    }

    // Subscribe local components to message bus
    for (const [id, componentInfo] of this.components.entries()) {
      for (const eventPattern of componentInfo.subscribe) {
        this.messageBus.subscribe(async (event, opts) => {
          if (this.eventMatchesPattern(event.type, eventPattern)) {
            await componentInfo.handler(
              event.data,
              (e) => this.emit(e, opts),
              event.type
            );
          }
        });
      }
    }
  }

  async emit(event, options) {
    await this.messageBus.publish(event, options);
  }

  // Rest of the existing methods remain unchanged
  describeWorkflows() {
    return {
      workflows: Array.from(this.workflows.keys()).map((workflowPath) => {
        const workflowName = path.basename(workflowPath);
        const componentEntries = Array.from(this.components.entries()).filter(
          ([compPath]) => compPath.includes(workflowName)
        );

        return {
          name: workflowName,
          components: componentEntries.map(([compPath, compModule]) => {
            const compDirName = path.basename(path.dirname(compPath));
            return {
              id: compDirName,
              subscribe: compModule.subscribe || [],
              emits: compModule.emits || [],
            };
          }),
        };
      }),
    };
  }

  async registerWorkflow(workflowPath) {
    try {
      const configPath = path.resolve(workflowPath, "config.js");
      const configModule = await import(pathToFileURL(configPath).href);
      this.workflows.set(workflowPath, configModule);
    } catch (error) {
      console.error(`Error registering workflow at ${workflowPath}:`, error);
    }
  }

  async registerComponent(componentPath) {
    try {
      const componentModule = await import(pathToFileURL(componentPath).href);
      if (componentModule.subscribe) {
        this.components.set(componentPath, {
          handler: componentModule.default,
          subscribe: componentModule.subscribe || [],
          emits: componentModule.emits || [],
        });
      }
    } catch (error) {
      console.error(`Error registering component at ${componentPath}:`, error);
    }
  }

  eventMatchesPattern(eventType, pattern) {
    if (pattern === "*") return true;
    if (pattern === eventType) return true;
    if (pattern.endsWith(".*")) {
      const prefix = pattern.slice(0, -2);
      return eventType.startsWith(prefix);
    }
    return false;
  }

  async findWorkflowFiles(basePath) {
    const workflows = [];
    try {
      const entries = await fs.promises.readdir(basePath, {
        withFileTypes: true,
      });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const workflowPath = path.join(basePath, entry.name);
          const files = await fs.promises.readdir(workflowPath);
          if (files.includes("config.js") && files.includes("version.json")) {
            workflows.push(path.resolve(workflowPath));
          }
        }
      }
    } catch (error) {
      console.error("Error finding workflow files:", error);
    }
    return workflows;
  }

  async findComponentFiles(paths) {
    const components = [];
    for (const basePath of paths) {
      try {
        const workflowDirs = await fs.promises.readdir(basePath, {
          withFileTypes: true,
        });

        for (const workflowDir of workflowDirs) {
          if (!workflowDir.isDirectory()) continue;

          const componentsPath = path.join(
            basePath,
            workflowDir.name,
            "components"
          );
          try {
            await this.searchComponents(componentsPath, components);
          } catch {
            // If components dir doesn't exist, skip
          }
        }
      } catch (error) {
        console.error("Error finding component files:", error);
      }
    }
    return components.map((c) => path.resolve(c));
  }

  async searchComponents(dir, components) {
    let entries;
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.searchComponents(fullPath, components);
      } else if (
        // Include both .js and .py files, but exclude test files
        (entry.name.endsWith(".js") || entry.name.endsWith(".py")) &&
        !entry.name.endsWith(".test.js") &&
        !entry.name.endsWith(".test.py")
      ) {
        components.push(fullPath);
      }
    }
  }
}
