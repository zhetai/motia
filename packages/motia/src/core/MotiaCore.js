import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import { InMemoryMessageBus } from "./MessageBus.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Core Orchestrator: MotiaCore
 * ----------------------------
 * MotiaCore serves as the central orchestrator of the Motia framework. It manages the lifecycle
 * of workflows, components, and the event bus, acting as the heart of the entire system.
 *
 * Key Responsibilities:
 * - Initialize and configure the message bus (either in-memory or a provided one)
 * - Load and register workflows and their associated components
 * - Emit events into the system and deliver them to subscribed components
 *
 * MotiaCore provides the foundational logic that ties together components, events,
 * and workflows, enabling flexible, event-driven behavior throughout the application.
 */
export class MotiaCore {
  constructor(options = {}) {
    this.messageBus = new InMemoryMessageBus();
    this.workflows = new Map();
    this.components = new Map();
    this.logger = options.logger;
  }

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
        // Store an object that includes the handler, subscribe, and emits arrays
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

  async emit(event, options) {
    await this.messageBus.publish(event, options);
  }

  async initialize(options = {}) {
    const workflowPaths = options.workflowPaths || ["./src/workflows"];
    if (this.logger) {
      await this.logger.initialize();
    }
    this.messageBus = options.messageBus || new InMemoryMessageBus();

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

    // Load all components from these workflows
    const componentFiles = await this.findComponentFiles(absoluteWorkflowPaths);
    for (const file of componentFiles) {
      await this.registerComponent(file);
    }

    // Subscribe components to message bus
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
            // Return absolute path
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
        entry.name.endsWith(".js") &&
        !entry.name.endsWith(".test.js")
      ) {
        if (entry.name.endsWith(".js") && !entry.name.endsWith(".test.js")) {
          components.push(fullPath);
        }
      }
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
}
