// packages/wistro/src/core/WistroCore.js

import { EventManager } from "./EventManager.js";
import { AgentManager } from "./agents/AgentManager.js";

export class WistroCore {
  constructor() {
    // You can remove environment-based defaults if you want them fully in config
    this.eventManager = new EventManager({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      prefix: "wistro:events:",
    });

    // We'll store the config for reference (e.g., if we want to describeWorkflows)
    this._config = null;
  }

  /**
   * Initialize the core from a config object (no fallback scanning).
   */
  async initialize(config) {
    if (!config) {
      throw new Error(
        "[WistroCore] No config provided. Aborting initialization."
      );
    }
    this._config = config;

    // 1) Initialize the EventManager
    await this.eventManager.initialize();

    // 2) Initialize an AgentManager with a callback that emits events
    this.agentManager = new AgentManager(async (event, componentId) => {
      await this.eventManager.emit(event, componentId);
    });
    await this.agentManager.initialize();

    // 3) Register agents from config.agents
    if (Array.isArray(config.agents)) {
      for (const agentDef of config.agents) {
        await this.agentManager.registerAgent(agentDef.name, {
          url: agentDef.url,
          runtime: agentDef.runtime,
          // ...any other fields in your agent definition
        });
      }
    }

    // 4) Register workflows & components
    if (Array.isArray(config.workflows)) {
      for (const wf of config.workflows) {
        // For each workflow, register all components
        if (Array.isArray(wf.components)) {
          for (const comp of wf.components) {
            // pass in comp.id so the NodeAgent sees the correct name
            await this.agentManager.registerComponent(
              comp.codePath,
              comp.agent,
              comp.id // e.g. "complex-workflow/conditional-branch"
            );

            // Then for each subscribed event, register a handler
            if (Array.isArray(comp.subscribe)) {
              for (const eventType of comp.subscribe) {
                const handler = async (evt) => {
                  await this.agentManager.executeComponent(comp.codePath, evt);
                };
                await this.eventManager.subscribe(eventType, comp.id, handler);
              }
            }
          }
        }
      }
    }

    console.log("[WistroCore] Initialized successfully from config.");
  }

  /**
   * Emit an event into the system, optionally specifying a source.
   */
  async emit(event, { source = "system" } = {}) {
    await this.eventManager.emit(event, source);
  }

  /**
   * Cleanup any resources (like message bus connections, agent processes, etc.).
   */
  async cleanup() {
    await this.eventManager.cleanup();
    if (this.agentManager) {
      await this.agentManager.cleanup();
    }
  }

  /**
   * (Optional) Return a simplified description of workflows & components
   * using the loaded config.
   */
  async describeWorkflows() {
    if (!this._config || !Array.isArray(this._config.workflows)) {
      return { workflows: [] };
    }

    const workflows = this._config.workflows.map((wf) => {
      return {
        name: wf.name,
        // If you had extra workflow-level fields (like "description"), include them
        components: (wf.components || []).map((comp) => ({
          id: comp.id,
          agent: comp.agent,
          subscribe: comp.subscribe || [],
          emits: comp.emits || [],
          codePath: comp.codePath,
          uiPath: comp.uiPath || null,
        })),
      };
    });

    return { workflows };
  }
}
