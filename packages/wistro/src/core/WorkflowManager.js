import crypto from "crypto";

export class WorkflowManager {
  constructor(eventManager, serverComponentManager, agentManager) {
    this.eventManager = eventManager;
    this.serverComponentManager = serverComponentManager;
    this.agentManager = agentManager;
    this._config = null;
  }

  generateTraceId() {
    return crypto.randomBytes(6).toString("hex");
  }

  async registerWorkflow(workflow) {
    if (!Array.isArray(workflow.components)) {
      return;
    }

    for (const component of workflow.components) {
      await this.registerComponent(component);
    }
  }

  async registerComponent(component) {
    const { id, agent, codePath, subscribe = [] } = component;

    if (!agent || agent === "server") {
      this.serverComponentManager.register(id, codePath);

      for (const eventType of subscribe) {
        const handler = async (evt) => {
          await this.serverComponentManager.execute(id, evt, {
            traceId: evt.metadata?.workflowTraceId,
            emit: async (event, componentId) => {
              await this.eventManager.emit(event, componentId);
            },
          });
        };
        await this.eventManager.subscribe(eventType, id, handler);
      }
    } else {
      await this.agentManager.registerComponent(codePath, agent, id);

      for (const eventType of subscribe) {
        const handler = async (evt) => {
          await this.agentManager.executeComponent(codePath, evt);
        };
        await this.eventManager.subscribe(eventType, id, handler);
      }
    }
  }

  async describeWorkflows() {
    if (!this._config || !Array.isArray(this._config.workflows)) {
      return { workflows: [] };
    }

    return {
      workflows: this._config.workflows.map((wf) => ({
        name: wf.name,
        components: (wf.components || []).map((comp) => ({
          id: comp.id,
          agent: comp.agent,
          subscribe: comp.subscribe || [],
          emits: comp.emits || [],
          codePath: comp.codePath,
          uiPath: comp.uiPath || null,
        })),
      })),
    };
  }

  setConfig(config) {
    this._config = config;
  }
}
