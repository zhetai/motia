// packages/motia/src/core/MotiaCore.js
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises"; // Use fs/promises instead of fs
import { EventManager } from "./EventManager.js";
import { AgentManager } from "./agents/AgentManager.js";

export class MotiaCore {
  constructor(options = {}) {
    this.workflows = new Map();
    this.eventManager = new EventManager({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      prefix: "motia:events:",
    });
  }

  async initialize(options = {}) {
    await this.eventManager.initialize();

    // Initialize agent manager with event emission callback
    this.agentManager = new AgentManager(async (event, componentId) => {
      await this.eventManager.emit(event, componentId);
    });

    // Initialize agents if configured
    if (options.agents) {
      await this.agentManager.initialize();
      for (const [name, config] of Object.entries(options.agents)) {
        await this.agentManager.registerAgent(name, config);
      }
    }

    // Load workflows and register components
    const workflowPaths = options.workflowPaths || ["./src/workflows"];
    await this.loadWorkflows(workflowPaths);

    console.log("[MotiaCore] Initialized successfully");
  }

  async emit(event, options = { source: "system" }) {
    await this.eventManager.emit(event, options.source);
  }

  getComponentId(componentPath) {
    const matches = componentPath.match(
      /workflows\/([^/]+)\/components\/([^/]+)/
    );
    if (!matches) {
      throw new Error(`Invalid component path: ${componentPath}`);
    }
    const [_, workflowName, componentName] = matches;
    return `${workflowName}/${componentName}`;
  }

  async loadWorkflows(paths) {
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
            const code = await fs.readFile(file, "utf8");
            const metadata = await this.extractComponentMetadata(code, fileExt);
            const componentId = this.getComponentId(file);

            if (metadata?.agent) {
              // Register with agent
              await this.agentManager.registerComponent(file, metadata.agent);

              // Register event subscriptions
              if (metadata.subscribe) {
                for (const eventType of metadata.subscribe) {
                  // Create handler for this subscription
                  const handler = async (event) => {
                    await this.agentManager.executeComponent(file, event);
                  };

                  await this.eventManager.subscribe(
                    eventType,
                    componentId,
                    handler
                  );
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error loading component ${file}:`, error);
        }
      }
    }
  }

  async findWorkflowDirectories(basePath) {
    const workflows = [];
    try {
      const entries = await fs.readdir(basePath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const workflowPath = path.join(basePath, entry.name);
          const files = await fs.readdir(workflowPath);
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
        const entries = await fs.readdir(basePath, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;

          const componentsPath = path.join(basePath, entry.name, "components");
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
    const entries = await fs.readdir(dir, { withFileTypes: true });
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

  async extractComponentMetadata(code, fileExt) {
    if (fileExt === ".py") {
      const metadataMatch = code.match(/metadata\s*=\s*({[\s\S]*?})/);
      const subscribeMatch = code.match(/subscribe\s*=\s*(\[[^\]]+\])/);
      const emitsMatch = code.match(/emits\s*=\s*(\[[^\]]+\])/);
      return {
        ...(metadataMatch
          ? JSON.parse(metadataMatch[1].replace(/'/g, '"'))
          : {}),
        subscribe: subscribeMatch
          ? JSON.parse(subscribeMatch[1].replace(/'/g, '"'))
          : [],
        emits: emitsMatch ? JSON.parse(emitsMatch[1].replace(/'/g, '"')) : [],
      };
    } else if (fileExt === ".js") {
      const metadataMatch = code.match(
        /export\s+const\s+metadata\s*=\s*({[\s\S]*?})/
      );
      const subscribeMatch = code.match(
        /export\s+const\s+subscribe\s*=\s*(\[[^\]]+\])/
      );
      const emitsMatch = code.match(
        /export\s+const\s+emits\s*=\s*(\[[^\]]+\])/
      );

      return {
        ...(metadataMatch ? Function(`return ${metadataMatch[1]}`)() : {}),
        subscribe: subscribeMatch
          ? Function(`return ${subscribeMatch[1]}`)()
          : [],
        emits: emitsMatch ? Function(`return ${emitsMatch[1]}`)() : [],
      };
    }
    throw new Error(`Unsupported file type: ${fileExt}`);
  }

  // This is for the UI. Probably need to refactor and combine these methods
  async describeWorkflows() {
    const workflows = [];

    for (const [workflowPath] of this.workflows.entries()) {
      try {
        // Get workflow name from the directory name
        const workflowName = path.basename(workflowPath);

        // Components are in workflowPath/components
        const componentsPath = path.join(workflowPath, "components");

        // Get all components for this workflow
        const components = [];
        const componentDirs = await fs.readdir(componentsPath, {
          withFileTypes: true,
        });

        for (const dir of componentDirs) {
          if (!dir.isDirectory()) continue;

          // Try to load both JS and Python components
          const jsPath = path.join(componentsPath, dir.name, "index.js");
          const pyPath = path.join(componentsPath, dir.name, "index.py");

          let metadata = null;
          let code = null;

          // Try JS first
          try {
            code = await fs.readFile(jsPath, "utf8");
            metadata = await this.extractComponentMetadata(code, ".js");
          } catch {
            // If JS doesn't exist, try Python
            try {
              code = await fs.readFile(pyPath, "utf8");
              metadata = await this.extractComponentMetadata(code, ".py");
            } catch {
              continue; // Skip if neither file exists
            }
          }

          components.push({
            id: dir.name,
            subscribe: metadata.subscribe || [],
            emits: metadata.emits || [],
            runtime: metadata.metadata?.runtime || "node",
            agent: metadata.metadata?.agent,
          });
        }

        // Get workflow config
        const configPath = path.join(workflowPath, "config.js");
        const configModule = await import(pathToFileURL(configPath));

        workflows.push({
          name: workflowName,
          description: configModule.config?.description || "",
          components,
        });
      } catch (error) {
        console.error(
          `Error describing workflow ${path.basename(workflowPath)}:`,
          error
        );
        // Continue with other workflows even if one fails
        continue;
      }
    }

    return { workflows };
  }

  async cleanup() {
    await this.eventManager.cleanup();
    if (this.agentManager) {
      await this.agentManager.cleanup();
    }
  }
}
