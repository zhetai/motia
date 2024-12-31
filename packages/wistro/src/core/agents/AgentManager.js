// packages/wistro/src/core/agents/AgentManager.js

import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

export class AgentManager {
  constructor(emitCallback) {
    /**
     * Maps agentName -> { name, url, runtime, status }
     */
    this.agents = new Map();

    /**
     * Maps componentPath -> { agent, componentId }
     */
    this.componentRegistry = new Map();

    /**
     * A Set of "agentName:componentPath" strings to track duplicates
     */
    this.registeredComponents = new Set();

    this.healthCheckInterval = null;
    this.emitCallback = emitCallback; // function(event, componentId) => void
  }

  async initialize() {
    // Start a health-check timer for all registered agents
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // NOTE: sleep before checking health checks in order to give time for the server to start
    await new Promise((resolve) => setTimeout(resolve, 10_000));

    this.healthCheckInterval = setInterval(() => {
      for (const agent of this.agents.values()) {
        this.checkAgentHealth(agent).catch((err) =>
          console.error("[AgentManager] Health check error:", err)
        );
      }
    }, 30_000);

    console.log("[AgentManager] Initialized");
  }

  /**
   * Register or update an agent definition in our local Map.
   * e.g. { name: "node-agent", url: "http://localhost:3000", runtime: "node" }
   */
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

    // Attempt up to 3 health checks
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

  /**
   * Register a component's source code with the correct remote agent
   * @param {string} componentPath - local path to the component's code
   * @param {string} agentName - name of the agent to deploy to
   * @param {string} componentId - ID of the component ("workflowName/componentName")
   *
   * Note: We no longer parse code for metadata. We'll rely on config to supply agentName, etc.
   */
  async registerComponent(componentPath, agentName, componentId) {
    if (!agentName || agentName === "server") {
      console.log(
        `[AgentManager] Skipping server-based component: ${componentId}`
      );
      return; // so we don't push code to an external agent
    }

    const componentKey = `${agentName}:${componentPath}`;
    // If we already have this, remove old registration
    if (this.registeredComponents.has(componentKey)) {
      await this.cleanupComponent(componentPath);
    }

    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`[AgentManager] Agent not found: ${agentName}`);
    }

    try {
      // Read the entire code file; we do *no* metadata parsing
      const code = await fs.readFile(componentPath, "utf-8");

      console.log(`[AgentManager] Registering component:`, {
        path: componentPath,
        agent: agentName,
        componentId,
      });

      // Send it to the remote agent's /register
      const response = await fetch(`${agent.url}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: componentId,
          code,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to deploy component: ${response.statusText}`);
      }

      // Store the registry info
      this.componentRegistry.set(componentPath, {
        agent: agentName,
        componentId,
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

  /**
   * Execute a component by calling the remote agent's /execute endpoint
   */
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

      // POST to agent
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

      // If the component emitted events, we forward them via emitCallback
      if (Array.isArray(result.events) && result.events.length > 0) {
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

  /**
   * Remove a previously registered component from our internal registry
   */
  async cleanupComponent(componentPath) {
    const component = this.componentRegistry.get(componentPath);
    if (!component) return;

    this.componentRegistry.delete(componentPath);
    const componentKey = `${component.agent}:${componentPath}`;
    this.registeredComponents.delete(componentKey);

    console.log(`[AgentManager] Cleaned up component: ${componentPath}`);
  }

  /**
   * Clean up all agents & components
   */
  async cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    for (const componentPath of this.componentRegistry.keys()) {
      await this.cleanupComponent(componentPath);
    }
    this.componentRegistry.clear();
    this.agents.clear();
    this.registeredComponents.clear();
    console.log("[AgentManager] Cleanup completed");
  }

  /**
   * Utility to check an agent’s /health endpoint
   */
  async checkAgentHealth(agent, attempt = 1) {
    if (!agent) {
      console.error("[AgentManager] No agent provided to checkAgentHealth");
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
}
