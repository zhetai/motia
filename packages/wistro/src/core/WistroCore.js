import { pathToFileURL } from "url";
import { EventManager } from "./EventManager.js";
import { AgentManager } from "./agents/AgentManager.js";
import { createStateAdapter } from "./state/index.js";
import crypto from "crypto";

export class WistroCore {
  constructor() {
    this.eventManager = new EventManager({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      prefix: "wistro:events:",
    });

    this._config = null;
    this.serverComponents = new Map();
    this.stateAdapter = null;
  }

  async initialize(config) {
    if (!config) {
      throw new Error(
        "[WistroCore] No config provided. Aborting initialization."
      );
    }
    this._config = config;

    // Initialize state adapter
    this.stateAdapter = createStateAdapter(config.state);

    // Initialize event manager
    await this.eventManager.initialize();

    // Initialize agent manager
    this.agentManager = new AgentManager(async (event, componentId) => {
      await this.eventManager.emit(event, componentId);
    });
    await this.agentManager.initialize();

    // Register globally declared agents
    if (Array.isArray(config.agents)) {
      for (const agentDef of config.agents) {
        await this.agentManager.registerAgent(agentDef.name, {
          url: agentDef.url,
          runtime: agentDef.runtime,
        });
      }
    }

    // Register workflows & components
    if (Array.isArray(config.workflows)) {
      for (const wf of config.workflows) {
        if (Array.isArray(wf.components)) {
          for (const comp of wf.components) {
            const agent = comp.agent;
            if (agent && agent !== "server") {
              await this.agentManager.registerComponent(
                comp.codePath,
                agent,
                comp.id
              );

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

  generateTraceId() {
    return crypto.randomBytes(6).toString("hex");
  }

  async emit(event, { source = "system", traceId = null } = {}) {
    // Generate traceId if not provided
    const workflowTraceId = traceId || this.generateTraceId();

    // Ensure metadata exists and includes traceId
    const enrichedEvent = {
      ...event,
      metadata: {
        ...(event.metadata || {}),
        workflowTraceId,
        source,
      },
    };

    await this.eventManager.emit(enrichedEvent, source);
  }

  registerServerComponent(comp) {
    this.serverComponents.set(comp.id, comp.codePath);
    console.log(`[WistroCore] Registered server-based component: ${comp.id}`);
  }

  async executeServerComponent(componentId, event) {
    const codePath = this.serverComponents.get(componentId);
    if (!codePath) {
      console.error(`[WistroCore] Server component not found: ${componentId}`);
      return;
    }

    try {
      const moduleUrl = pathToFileURL(codePath).href + `?update=${Date.now()}`;
      const compModule = await import(moduleUrl);

      const emittedEvents = [];
      const traceId = event.metadata?.workflowTraceId;

      const ctx = {
        state: this.stateAdapter,
        traceId,
        emit: async (newEvent) => {
          // Ensure child events maintain the same traceId
          const enrichedEvent = {
            ...newEvent,
            metadata: {
              ...(newEvent.metadata || {}),
              workflowTraceId: traceId,
            },
          };
          emittedEvents.push(enrichedEvent);
          await this.eventManager.emit(enrichedEvent, componentId);
        },
      };

      // Note: We pass ctx.emit instead of a bare emit function
      await compModule.default(event.data, ctx.emit, ctx);

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

  async cleanup() {
    if (this.stateAdapter) {
      await this.stateAdapter.cleanup();
    }
    await this.eventManager.cleanup();
    if (this.agentManager) {
      await this.agentManager.cleanup();
    }
  }

  async describeWorkflows() {
    if (!this._config || !Array.isArray(this._config.workflows)) {
      return { workflows: [] };
    }

    const workflows = this._config.workflows.map((wf) => ({
      name: wf.name,
      components: (wf.components || []).map((comp) => ({
        id: comp.id,
        agent: comp.agent,
        subscribe: comp.subscribe || [],
        emits: comp.emits || [],
        codePath: comp.codePath,
        uiPath: comp.uiPath || null,
      })),
    }));

    return { workflows };
  }
}
