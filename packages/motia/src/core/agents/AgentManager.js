import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

export class AgentManager {
  constructor(messageBus) {
    this.agents = new Map();
    this.componentRegistry = new Map();
    this.messageBus = messageBus;
    this.healthCheckInterval = null;
  }

  getComponentId(componentPath) {
    const matches = componentPath.match(
      /workflows\/([^/]+)\/components\/([^/]+)/
    );
    if (!matches) throw new Error(`Invalid component path: ${componentPath}`);
    const [_, workflowName, componentName] = matches;
    return `${workflowName}/${componentName}`;
  }

  async initialize() {
    this.healthCheckInterval = setInterval(() => {
      for (const agent of this.agents.values()) {
        this.checkAgentHealth(agent);
      }
    }, 30000);
    console.log(
      "[AgentManager] Initializing with messageBus:",
      !!this.messageBus
    );
    this.messageBus.subscribe(async (event) => {
      console.log(`[AgentManager] Received event: ${event.type}`);
      await this.routeEventToComponent(event);
    });
  }

  async registerAgent(name, config) {
    const agent = {
      name,
      url: config.url,
      runtime: config.runtime,
      status: "initializing",
    };

    if (await this.checkAgentHealth(agent)) {
      agent.status = "ready";
      this.agents.set(name, agent);
      console.log(`Agent ${name} registered successfully`);
    } else {
      throw new Error(`Failed to register agent ${name}: health check failed`);
    }
  }

  async registerComponent(componentPath, agentName) {
    const agent = this.agents.get(agentName);
    if (!agent) throw new Error(`Agent ${agentName} not found`);

    try {
      const code = await fs.readFile(componentPath, "utf-8");
      const componentId = this.getComponentId(componentPath);
      const fileExt = path.extname(componentPath);

      // Extract metadata based on file type
      let metadata;
      if (fileExt === ".py") {
        const metadataMatch = code.match(/metadata\s*=\s*({[\s\S]*?})/);
        const subscribeMatch = code.match(/subscribe\s*=\s*(\[[^\]]+\])/);
        metadata = {
          ...(metadataMatch
            ? JSON.parse(metadataMatch[1].replace(/'/g, '"'))
            : {}),
          subscribe: subscribeMatch
            ? JSON.parse(subscribeMatch[1].replace(/'/g, '"'))
            : [],
        };
      } else {
        metadata = await import(componentPath);
      }

      // Register with agent
      const response = await fetch(`${agent.url}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: componentId,
          code: code,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to deploy component: ${response.statusText}`);
      }

      // Store only what we need for routing
      this.componentRegistry.set(componentPath, {
        agent: agentName,
        componentId,
        subscribe: metadata.subscribe || [],
      });

      console.log(
        `[AgentManager] Component ${componentId} registered with ${agentName}`
      );
    } catch (error) {
      console.error(`Failed to register component ${componentPath}:`, error);
      throw error;
    }
  }

  async checkAgentHealth(agent) {
    if (!agent) {
      console.error("No agent provided to checkAgentHealth");
      return false;
    }
    try {
      const response = await fetch(`${agent.url}/health`);
      if (!response.ok) {
        console.error(
          `Health check failed for agent ${agent.name}: ${response.statusText}`
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Health check failed for agent ${agent.name}:`, error);
      return false;
    }
  }

  async routeEventToComponent(event) {
    console.log("[AgentManager] Finding subscribers for event:", event.type);
    const subscribers = Array.from(this.componentRegistry.entries()).filter(
      ([_, comp]) => comp.subscribe.includes(event.type)
    );

    console.log(
      "[AgentManager] Found subscribers:",
      subscribers.map(([_, comp]) => comp.componentId)
    );

    for (const [_, component] of subscribers) {
      const agent = this.agents.get(component.agent);
      if (!agent || agent.status !== "ready") continue;

      try {
        const response = await fetch(
          `${agent.url}/execute/${component.componentId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
          }
        );

        if (!response.ok) {
          throw new Error(`Component execution failed: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.events?.length) {
          for (const newEvent of result.events) {
            await this.messageBus.publish(newEvent);
          }
        }
      } catch (error) {
        console.error(
          `Failed to execute component ${component.componentId}:`,
          error
        );
      }
    }
  }

  async cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.componentRegistry.clear();
    this.agents.clear();
  }
}
