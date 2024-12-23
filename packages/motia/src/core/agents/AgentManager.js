// packages/motia/src/core/agents/AgentManager.js
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

export class AgentManager {
  constructor(emitCallback) {
    this.agents = new Map();
    this.componentRegistry = new Map();
    this.registeredComponents = new Set();
    this.healthCheckInterval = null;
    this.emitCallback = emitCallback; // Function to emit events via EventManager
  }

  async initialize() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      for (const agent of this.agents.values()) {
        this.checkAgentHealth(agent);
      }
    }, 30000);

    console.log("[AgentManager] Initialized");
  }

  async registerAgent(name, config) {
    if (this.agents.has(name)) {
      console.log(
        `[AgentManager] Agent ${name} already registered, updating config`
      );
      const existingAgent = this.agents.get(name);
      existingAgent.url = config.url;
      existingAgent.runtime = config.runtime;
      return;
    }

    const agent = {
      name,
      url: config.url,
      runtime: config.runtime,
      status: "initializing",
    };

    // Check health with retries
    for (let i = 0; i < 3; i++) {
      if (await this.checkAgentHealth(agent)) {
        agent.status = "ready";
        this.agents.set(name, agent);
        console.log(`[AgentManager] Successfully registered agent ${name}`);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error(`Failed to register agent ${name}: health check failed`);
  }

  async registerComponent(componentPath, agentName) {
    const componentKey = `${agentName}:${componentPath}`;

    // Clean up existing registration if necessary
    if (this.registeredComponents.has(componentKey)) {
      await this.cleanupComponent(componentPath);
    }

    const agent = this.agents.get(agentName);
    if (!agent) throw new Error(`Agent ${agentName} not found`);

    try {
      const code = await fs.readFile(componentPath, "utf-8");
      const componentId = this.getComponentId(componentPath);
      const fileExt = path.extname(componentPath);

      // Extract metadata (subscriptions etc)
      const metadata = await this.extractComponentMetadata(code, fileExt);

      // Make sure we have the agent property from metadata
      const agentMetadata = metadata.metadata?.agent || metadata.agent;

      console.log(`[AgentManager] Registering component:`, {
        path: componentPath,
        agent: agentName,
        id: componentId,
        subscriptions: metadata.subscribe || [],
        agentMetadata, // Log to verify we're getting the right value
      });

      // Register with agent
      const response = await fetch(`${agent.url}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: componentId,
          code: code,
          agent: agentMetadata, // Include agent metadata if needed
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to deploy component: ${response.statusText}`);
      }

      // Store component info
      this.componentRegistry.set(componentPath, {
        agent: agentName,
        componentId,
        metadata,
      });

      this.registeredComponents.add(componentKey);

      console.log(
        `[AgentManager] Successfully registered component: ${componentPath}`
      );
    } catch (error) {
      console.error(`Failed to register component ${componentPath}:`, error);
      throw error;
    }
  }

  async executeComponent(componentPath, event) {
    const component = this.componentRegistry.get(componentPath);
    if (!component) {
      console.error(`[AgentManager] Component not found: ${componentPath}`);
      return;
    }

    const agent = this.agents.get(component.agent);
    if (!agent || agent.status !== "ready") {
      console.error(`[AgentManager] Agent ${component.agent} not ready`);
      return;
    }

    try {
      console.log(
        `[AgentManager] Executing component ${component.componentId}`,
        {
          eventType: event.type,
          eventId: event.metadata?.eventId,
        }
      );

      const response = await fetch(
        `${agent.url}/execute/${component.componentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: event.data,
            metadata: event.metadata,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Component execution failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Emit result events through callback
      if (result.events?.length) {
        console.log(
          `[AgentManager] Component ${component.componentId} emitted ${result.events.length} events`
        );
        for (const newEvent of result.events) {
          await this.emitCallback(newEvent, component.componentId);
        }
      }

      return result;
    } catch (error) {
      console.error(
        `[AgentManager] Failed to execute component ${component.componentId}:`,
        error
      );
      throw error;
    }
  }

  async cleanupComponent(componentPath) {
    const component = this.componentRegistry.get(componentPath);
    if (!component) return;

    // Remove from registries
    this.componentRegistry.delete(componentPath);
    const componentKey = `${component.agent}:${componentPath}`;
    this.registeredComponents.delete(componentKey);

    console.log(`[AgentManager] Cleaned up component: ${componentPath}`);
  }

  async cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Clean up all components
    for (const componentPath of this.componentRegistry.keys()) {
      await this.cleanupComponent(componentPath);
    }

    // Clear collections
    this.componentRegistry.clear();
    this.agents.clear();
    this.registeredComponents.clear();

    console.log("[AgentManager] Cleanup completed");
  }

  // Helper methods
  getComponentId(componentPath) {
    const matches = componentPath.match(
      /workflows\/([^/]+)\/components\/([^/]+)/
    );
    if (!matches) throw new Error(`Invalid component path: ${componentPath}`);
    const [_, workflowName, componentName] = matches;
    return `${workflowName}/${componentName}`;
  }

  async checkAgentHealth(agent, attempt = 1) {
    if (!agent) {
      console.error("No agent provided to checkAgentHealth");
      return false;
    }
    try {
      console.log(
        `[AgentManager] Checking health for ${agent.name} (attempt ${attempt}/3)`
      );
      const response = await fetch(`${agent.url}/health`);
      return response.ok;
    } catch (error) {
      console.error(`Health check failed for agent ${agent.name}:`, error);
      return false;
    }
  }

  async extractComponentMetadata(code, fileExt) {
    if (fileExt === ".py") {
      const metadataMatch = code.match(/metadata\s*=\s*({[\s\S]*?})/);
      const subscribeMatch = code.match(/subscribe\s*=\s*(\[[^\]]+\])/);
      return {
        ...(metadataMatch
          ? JSON.parse(metadataMatch[1].replace(/'/g, '"'))
          : {}),
        subscribe: subscribeMatch
          ? JSON.parse(subscribeMatch[1].replace(/'/g, '"'))
          : [],
      };
    } else if (fileExt === ".js") {
      const metadataMatch = code.match(
        /export\s+const\s+metadata\s*=\s*({[\s\S]*?})/
      );
      const subscribeMatch = code.match(
        /export\s+const\s+subscribe\s*=\s*(\[[^\]]+\])/
      );

      return {
        ...(metadataMatch ? Function(`return ${metadataMatch[1]}`)() : {}),
        subscribe: subscribeMatch
          ? Function(`return ${subscribeMatch[1]}`)()
          : [],
      };
    }
    throw new Error(`Unsupported file type: ${fileExt}`);
  }
}
