// packages/motia/src/core/agents/AgentManager.js
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
    this.healthCheckInterval = setInterval(
      () => this.checkAgentHealth(),
      30000
    );
    this.messageBus.subscribe(async (event) => {
      console.log(
        `[AgentManager] Received event: ${event.type}`,
        event.metadata?.fromAgent ? "(from agent)" : "(new event)"
      );
      if (!event.metadata?.fromAgent) {
        await this.routeEventToComponent(event);
      }
    });
  }

  async registerAgent(name, config) {
    const agent = {
      name,
      url: config.url,
      runtime: config.runtime,
      status: "initializing",
      lastSeen: Date.now(),
      components: new Set(),

      async checkHealth() {
        try {
          const response = await fetch(`${config.url}/health`);
          if (!response.ok) {
            throw new Error(`Health check failed: ${response.statusText}`);
          }
          return true;
        } catch (error) {
          console.error(`Health check failed for agent ${name}:`, error);
          return false;
        }
      },
    };

    if (await agent.checkHealth()) {
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

      // Skip if file extension doesn't match agent runtime
      const expectedExt = agent.runtime === "python" ? ".py" : ".js";
      if (fileExt !== expectedExt) {
        console.log(
          `Skipping ${componentPath} - wrong runtime for ${agentName}`
        );
        return;
      }

      // Deploy to agent
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

      // Extract metadata based on runtime
      let metadata;
      if (agent.runtime === "python") {
        const metadataMatch = code.match(/metadata\s*=\s*({[\s\S]*?})/);
        const subscribeMatch = code.match(/subscribe\s*=\s*(\[[^\]]+\])/);
        const emitsMatch = code.match(/emits\s*=\s*(\[[^\]]+\])/);

        metadata = {
          subscribe: subscribeMatch
            ? JSON.parse(subscribeMatch[1].replace(/'/g, '"'))
            : [],
          emits: emitsMatch ? JSON.parse(emitsMatch[1].replace(/'/g, '"')) : [],
          metadata: metadataMatch
            ? JSON.parse(metadataMatch[1].replace(/'/g, '"'))
            : {},
        };
      } else {
        metadata = await import(componentPath);
      }

      // Register component metadata
      this.componentRegistry.set(componentPath, {
        agent: agentName,
        componentId,
        subscribe: metadata.subscribe || [],
        emits: metadata.emits || [],
        metadata: metadata.metadata || {},
      });

      console.log(`Component ${componentId} registered with ${agentName}`);
    } catch (error) {
      console.error(`Failed to register component ${componentPath}:`, error);
      throw error;
    }
  }

  async checkAgentHealth() {
    const checks = [];
    for (const [name, agent] of this.agents) {
      checks.push(
        agent.checkHealth().then((healthy) => {
          agent.lastSeen = Date.now();
          agent.status = healthy ? "ready" : "unhealthy";
          if (!healthy) {
            console.warn(`Agent ${name} is unhealthy`);
          }
        })
      );
    }
    await Promise.all(checks);
  }

  async routeEventToComponent(event) {
    // Track processed events to prevent duplicates
    const eventId = `${event.type}-${Date.now()}`;
    if (this._processedEvents?.has(eventId)) {
      return;
    }
    if (!this._processedEvents) {
      this._processedEvents = new Set();
    }
    this._processedEvents.add(eventId);

    // Cleanup old events (keep last 1000)
    if (this._processedEvents.size > 1000) {
      const oldEvents = Array.from(this._processedEvents).slice(0, -1000);
      oldEvents.forEach((id) => this._processedEvents.delete(id));
    }

    const enrichedEvent = {
      ...event,
      metadata: {
        ...event.metadata,
        fromAgent: true,
        routedAt: Date.now(),
        eventId: `${event.type}-${crypto.randomUUID()}`,
      },
    };

    const subscribers = Array.from(this.componentRegistry.entries())
      .filter(([_, comp]) => comp.subscribe.includes(event.type))
      // Don't route to the component that just emitted
      .filter(([_, comp]) => !(comp.emits || []).includes(event.type));

    if (subscribers.length === 0) {
      console.log(`No subscribers found for event type: ${event.type}`);
      return;
    }

    const executions = subscribers.map(async ([_, component]) => {
      const agent = this.agents.get(component.agent);
      if (!agent || agent.status !== "ready") return;

      try {
        const response = await fetch(
          `${agent.url}/execute/${component.componentId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(enrichedEvent),
          }
        );

        if (!response.ok) {
          throw new Error(`Component execution failed: ${response.statusText}`);
        }
      } catch (error) {
        console.error(
          `Failed to execute component ${component.componentId}:`,
          error
        );
      }
    });

    await Promise.all(executions);
  }

  async cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    const cleanups = Array.from(this.agents.values()).map(async (agent) => {
      try {
        await fetch(`${agent.url}/shutdown`, { method: "POST" });
      } catch (error) {
        console.warn(
          `Failed to gracefully shutdown agent ${agent.name}:`,
          error
        );
      }
    });

    await Promise.all(cleanups);
    this.agents.clear();
    this.componentRegistry.clear();
  }
}
