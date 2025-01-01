import { EventManager } from "./EventManager.js";
import { AgentManager } from "./agents/AgentManager.js";
import { createStateAdapter } from "./state/index.js";
import { ServerComponentManager } from "./ServerComponentManager.js";
import { WorkflowManager } from "./WorkflowManager.js";

export class WistroCore {
  constructor() {
    this.eventManager = new EventManager({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      prefix: "wistro:events:",
    });

    this.stateAdapter = null;
    this.serverComponentManager = null;
    this.agentManager = null;
    this.workflowManager = null;
  }

  async initialize(config) {
    if (!config) {
      throw new Error(
        "[WistroCore] No config provided. Aborting initialization."
      );
    }

    // Initialize core services
    await this.initializeServices(config);

    // Register agents
    await this.registerAgents(config.agents);

    // Register workflows
    await this.registerWorkflows(config.workflows);

    console.log("[WistroCore] Initialized successfully from config.");
  }

  async initializeServices(config) {
    // Initialize state adapter
    this.stateAdapter = createStateAdapter(config.state);

    // Initialize event manager
    await this.eventManager.initialize();

    // Initialize agent manager
    this.agentManager = new AgentManager(async (event, componentId) => {
      await this.eventManager.emit(event, componentId);
    });
    await this.agentManager.initialize();

    // Initialize server component manager
    this.serverComponentManager = new ServerComponentManager(this.stateAdapter);

    // Initialize workflow manager
    this.workflowManager = new WorkflowManager(
      this.eventManager,
      this.serverComponentManager,
      this.agentManager
    );
    this.workflowManager.setConfig(config);
  }

  async registerAgents(agents = []) {
    for (const agent of agents) {
      await this.agentManager.registerAgent(agent.name, {
        url: agent.url,
        runtime: agent.runtime,
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
    if (this.agentManager) {
      await this.agentManager.cleanup();
    }
    this.serverComponentManager.clear();
  }
}
