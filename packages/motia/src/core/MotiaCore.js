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
    this.logger = options.logger;
  }

  async initialize(options = {}) {
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

    // Load workflows and register components
    const workflowPaths = options.workflowPaths || ["./src/workflows"];
    await this.loadWorkflows(workflowPaths);
  }

  async emit(event, options) {
    await this.messageBus.publish(event, options);
  }

  describeWorkflows() {
    return {
      workflows: Array.from(this.workflows.keys()).map((workflowPath) => {
        const workflowName = path.basename(workflowPath);
        return {
          name: workflowName,
          path: workflowPath,
        };
      }),
    };
  }

  async loadWorkflows(paths) {
    this.workflows = new Map();

    // Convert paths to absolute
    const absolutePaths = paths.map((p) => path.resolve(p));

    // Load workflow configurations
    for (const basePath of absolutePaths) {
      const workflowDirs = await this.findWorkflowDirectories(basePath);
      for (const workflowPath of workflowDirs) {
        await this.registerWorkflow(workflowPath);
      }
    }

    // Register components with agents
    if (this.agentManager) {
      const componentFiles = await this.findComponentFiles(absolutePaths);
      for (const file of componentFiles) {
        try {
          const fileExt = path.extname(file);
          if (fileExt === ".js" || fileExt === ".py") {
            const code = await fs.promises.readFile(file, "utf-8");
            const metadata = await this.extractComponentMetadata(code, fileExt);
            if (metadata?.agent) {
              await this.agentManager.registerComponent(file, metadata.agent);
            }
          }
        } catch (error) {
          console.error(`Error loading component ${file}:`, error);
        }
      }
    }
  }

  async extractComponentMetadata(code, fileExt) {
    if (fileExt === ".py") {
      const metadataMatch = code.match(/metadata\s*=\s*({[\s\S]*?})/);
      if (metadataMatch) {
        return JSON.parse(metadataMatch[1].replace(/'/g, '"'));
      }
    } else {
      // For JS files, look for export const metadata = {...}
      const metadataMatch = code.match(
        /export\s+const\s+metadata\s*=\s*({[\s\S]*?})/
      );
      if (metadataMatch) {
        // Use Function to safely evaluate the metadata object
        return Function(`return ${metadataMatch[1]}`)();
      }
    }
    return null;
  }

  async findWorkflowDirectories(basePath) {
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
            workflows.push(workflowPath);
          }
        }
      }
    } catch (error) {
      console.error("Error finding workflow directories:", error);
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
            await this.searchComponentFiles(componentsPath, components);
          } catch {
            // Skip if components directory doesn't exist
          }
        }
      } catch (error) {
        console.error("Error finding component files:", error);
      }
    }
    return components;
  }

  async searchComponentFiles(dir, components) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.searchComponentFiles(fullPath, components);
      } else if (
        (entry.name.endsWith(".js") || entry.name.endsWith(".py")) &&
        !entry.name.includes(".test.")
      ) {
        components.push(fullPath);
      }
    }
  }

  async registerWorkflow(workflowPath) {
    try {
      const configPath = path.join(workflowPath, "config.js");
      const configModule = await import(pathToFileURL(configPath));
      this.workflows.set(workflowPath, configModule);
    } catch (error) {
      console.error(`Error registering workflow at ${workflowPath}:`, error);
    }
  }
}
