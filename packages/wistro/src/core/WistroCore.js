// packages/wistro/src/core/WistroCore.js
import { pathToFileURL } from "url";
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
    this.serverComponents = new Map();
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

    // 1) EventManager init
    await this.eventManager.initialize();

    // 2) AgentManager
    this.agentManager = new AgentManager(async (event, componentId) => {
      await this.eventManager.emit(event, componentId);
    });
    await this.agentManager.initialize();

    // 3) Register any globally declared agents
    if (Array.isArray(config.agents)) {
      for (const agentDef of config.agents) {
        await this.agentManager.registerAgent(agentDef.name, {
          url: agentDef.url,
          runtime: agentDef.runtime,
        });
      }
    }

    // 4) Register workflows & components
    if (Array.isArray(config.workflows)) {
      for (const wf of config.workflows) {
        if (Array.isArray(wf.components)) {
          for (const comp of wf.components) {
            // Distinguish endpoint-based vs. server-based
            const agent = comp.agent;
            if (agent && agent !== "server") {
              // Endpoint-based
              await this.agentManager.registerComponent(
                comp.codePath,
                agent,
                comp.id
              );

              // Subscribe each event => calls agentManager.executeComponent
              if (Array.isArray(comp.subscribe)) {
                for (const eventType of comp.subscribe) {
                  const handler = async (evt) => {
                    await this.agentManager.executeComponent(
                      comp.codePath,
                      evt
                    );
                  };
                  await this.eventManager.subscribe(
                    eventType,
                    comp.id,
                    handler
                  );
                }
              }
            } else {
              // Server-based
              this.registerServerComponent(comp);

              if (Array.isArray(comp.subscribe)) {
                for (const eventType of comp.subscribe) {
                  const handler = async (evt) => {
                    await this.executeServerComponent(comp.id, evt);
                  };
                  await this.eventManager.subscribe(
                    eventType,
                    comp.id,
                    handler
                  );
                }
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

  // todo: need to refactor these out of core
  registerServerComponent(comp) {
    // comp => { id, agent, codePath, subscribe, emits, ... }
    this.serverComponents.set(comp.id, comp.codePath);
    console.log(`[WistroCore] Registered server-based component: ${comp.id}`);
  }

  // todo: need to refactor these out of core
  async executeServerComponent(componentId, event) {
    const codePath = this.serverComponents.get(componentId);
    if (!codePath) {
      console.error(`[WistroCore] Server component not found: ${componentId}`);
      return;
    }

    try {
      // TODO: I don't think we need to do this. Need to remove any path related things from core
      // Force fresh import each time (if you want a hot-reload style)
      const moduleUrl = pathToFileURL(codePath).href + `?update=${Date.now()}`;
      const compModule = await import(moduleUrl);

      const emittedEvents = [];
      // Run the default export
      await compModule.default(event.data, async (newEvent) => {
        emittedEvents.push(newEvent);
        // Re-emit via eventManager
        await this.eventManager.emit(newEvent, componentId);
      });

      if (emittedEvents.length > 0) {
        console.log(
          `[WistroCore] Server component ${componentId} emitted ${emittedEvents.length} event(s)`
        );
      }
    } catch (error) {
      console.error(
        `[WistroCore] Error executing server component ${componentId}:`,
        error
      );
      throw error;
    }
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
