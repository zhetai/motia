import { EventManager } from "./EventManager.js";
import { EndpointManager } from "./endpoints/EndpointManager.js";
import { ServerComponentManager } from "./ServerComponentManager.js";
import { WorkflowManager } from "./WorkflowManager.js";
import { ConfigurationManager } from "./config/ConfigurationManager.js";

export class WistroCore {
  constructor() {
    this.configManager = new ConfigurationManager();
    this.eventManager = null;
    this.stateAdapter = null;
    this.serverComponentManager = null;
    this.endpointManager = null;
    this.workflowManager = null;
  }

  async initialize(config) {
    if (!config) {
      throw new Error(
        "[WistroCore] No config provided. Aborting initialization."
      );
    }

    // Initialize configuration
    const validatedConfig = await this.configManager.initialize(config);

    // Initialize services with validated config
    await this.initializeServices(validatedConfig);

    // Register endpoints and workflows
    await this.registerEndpoints(validatedConfig.endpoints);
    await this.registerWorkflows(validatedConfig.workflows);

    console.log("[WistroCore] Initialized successfully from config.");
  }

  async initializeServices(config) {
    console.log("[WistroCore] Initializing endpoints:", config.endpoints);
    // Initialize state adapter with validated config
    // this.stateAdapter = createStateAdapter(config.state);

    // Initialize event manager with Redis config
    this.eventManager = new EventManager({
      ...this.configManager.getRedisConfig(),
      prefix: "wistro:events:",
    });
    await this.eventManager.initialize();

    // Initialize endpoint manager
    this.endpointManager = new EndpointManager(async (event, componentId) => {
      await this.eventManager.emit(event, componentId);
    });
    await this.endpointManager.initialize();

    // Initialize server component manager
    this.serverComponentManager = new ServerComponentManager(undefined);

    // Initialize workflow manager
    this.workflowManager = new WorkflowManager(
      this.eventManager,
      this.serverComponentManager,
      this.endpointManager
    );
    this.workflowManager.setConfig(config);
  }

  async registerEndpoints(endpoints = []) {
    for (const endpoint of endpoints) {
      await this.endpointManager.registerEndpoint(endpoint.name, {
        url: endpoint.url,
        runtime: endpoint.runtime,
      });
    }
  }

  async registerWorkflows(workflows = []) {
    for (const workflow of workflows) {
      await this.workflowManager.registerWorkflow(workflow);
    }
  }

  async emit(event, { source = "system", traceId = null } = {}) {
    const workflowTraceId = traceId || this.workflowManager.generateTraceId();

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

  async describeWorkflows() {
    return this.workflowManager.describeWorkflows();
  }

  async cleanup() {
    if (this.stateAdapter) {
      await this.stateAdapter.cleanup();
    }
    await this.eventManager.cleanup();
    if (this.endpointManager) {
      await this.endpointManager.cleanup();
    }
    this.serverComponentManager.clear();
  }
}
