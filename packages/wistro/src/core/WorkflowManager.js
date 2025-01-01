import crypto from "crypto";

export class WorkflowManager {
  constructor(eventManager, serverComponentManager, endpointManager) {
    this.eventManager = eventManager;
    this.serverComponentManager = serverComponentManager;
    this.endpointManager = endpointManager;
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
    const { id, endpoint, codePath, subscribe = [] } = component;

    if (!endpoint || endpoint === "server") {
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
      await this.endpointManager.registerComponent(codePath, endpoint, id);

      for (const eventType of subscribe) {
        const handler = async (evt) => {
          await this.endpointManager.executeComponent(codePath, evt);
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
          endpoint: comp.endpoint,
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
