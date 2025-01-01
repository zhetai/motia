import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

export class EndpointManager {
  constructor(emitCallback) {
    /**
     * Maps endpointName -> { name, url, runtime, status }
     */
    this.endpoints = new Map();

    /**
     * Maps componentPath -> { endpoint, componentId }
     */
    this.componentRegistry = new Map();

    /**
     * A Set of "endpointName:componentPath" strings to track duplicates
     */
    this.registeredComponents = new Set();

    this.healthCheckInterval = null;
    this.emitCallback = emitCallback; // function(event, componentId) => void
  }

  async initialize() {
    // Start a health-check timer for all registered endpoints
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // NOTE: sleep before checking health checks in order to give time for the server to start
    await new Promise((resolve) => setTimeout(resolve, 200));

    this.healthCheckInterval = setInterval(() => {
      for (const endpoint of this.endpoints.values()) {
        this.checkEndpointHealth(endpoint).catch((err) =>
          console.error("[EndpointManager] Health check error:", err)
        );
      }
    }, 30_000);

    console.log("[EndpointManager] Initialized");
  }

  /**
   * Register or update an endpoint definition in our local Map.
   * e.g. { name: "node-endpoint", url: "http://localhost:3000", runtime: "node" }
   */
  async registerEndpoint(name, config) {
    if (this.endpoints.has(name)) {
      console.log(
        `[EndpointManager] Endpoint ${name} already registered, updating config`
      );
      const existingEndpoint = this.endpoints.get(name);
      existingEndpoint.url = config.url;
      existingEndpoint.runtime = config.runtime;
      return;
    }

    const endpoint = {
      name,
      url: config.url,
      runtime: config.runtime,
      status: "initializing",
    };

    // Attempt up to 3 health checks
    for (let i = 0; i < 3; i++) {
      if (await this.checkEndpointHealth(endpoint)) {
        endpoint.status = "ready";
        this.endpoints.set(name, endpoint);
        console.log(
          `[EndpointManager] Successfully registered endpoint ${name}`
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    throw new Error(`Failed to register endpoint ${name}: health check failed`);
  }

  /**
   * Register a component's source code with the correct remote endpoint
   * @param {string} componentPath - local path to the component's code
   * @param {string} endpointName - name of the endpoint to deploy to
   * @param {string} componentId - ID of the component ("workflowName/componentName")
   *
   * Note: We no longer parse code for metadata. We'll rely on config to supply endpointName, etc.
   */
  async registerComponent(componentPath, endpointName, componentId) {
    if (!endpointName || endpointName === "server") {
      console.log(
        `[EndpointManager] Skipping server-based component: ${componentId}`
      );
      return; // so we don't push code to an external endpoint
    }

    const componentKey = `${endpointName}:${componentPath}`;
    // If we already have this, remove old registration
    if (this.registeredComponents.has(componentKey)) {
      await this.cleanupComponent(componentPath);
    }

    const endpoint = this.endpoints.get(endpointName);
    if (!endpoint) {
      throw new Error(`[EndpointManager] Endpoint not found: ${endpointName}`);
    }

    try {
      // Read the entire code file; we do *no* metadata parsing
      const code = await fs.readFile(componentPath, "utf-8");

      console.log(`[EndpointManager] Registering component:`, {
        path: componentPath,
        endpoint: endpointName,
        componentId,
      });

      // Send it to the remote endpoint's /register
      const response = await fetch(`${endpoint.url}/register`, {
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
        endpoint: endpointName,
        componentId,
      });
      this.registeredComponents.add(componentKey);

      console.log(
        `[EndpointManager] Successfully registered component: ${componentPath}`
      );
    } catch (error) {
      console.error(`Failed to register component ${componentPath}:`, error);
      throw error;
    }
  }

  async executeComponent(componentPath, event) {
    const component = this.componentRegistry.get(componentPath);
    if (!component) {
      console.error(`[EndpointManager] Component not found: ${componentPath}`);
      return;
    }

    // Get the endpoint from component.endpoint
    const endpoint = this.endpoints.get(component.endpoint);
    if (!endpoint || endpoint.status !== "ready") {
      console.error(
        `[EndpointManager] Endpoint ${component.endpoint} not ready`
      );
      return;
    }

    try {
      console.log(
        `[EndpointManager] Executing component ${component.componentId}`,
        {
          eventType: event.type,
          eventId: event.metadata?.eventId,
          traceId: event.metadata?.workflowTraceId,
        }
      );

      const response = await fetch(
        `${endpoint.url}/execute/${component.componentId}`,
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

      if (Array.isArray(result.events) && result.events.length > 0) {
        console.log(
          `[EndpointManager] Component ${component.componentId} emitted ${result.events.length} events`
        );
        for (const newEvent of result.events) {
          const enrichedEvent = {
            ...newEvent,
            metadata: {
              ...(newEvent.metadata || {}),
              workflowTraceId: event.metadata?.workflowTraceId,
            },
          };
          await this.emitCallback(enrichedEvent, component.componentId);
        }
      }

      return result;
    } catch (error) {
      console.error(
        `[EndpointManager] Failed to execute component ${component.componentId}:`,
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
    const componentKey = `${component.endpoint}:${componentPath}`;
    this.registeredComponents.delete(componentKey);

    console.log(`[EndpointManager] Cleaned up component: ${componentPath}`);
  }

  /**
   * Clean up all endpoints & components
   */
  async cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    for (const componentPath of this.componentRegistry.keys()) {
      await this.cleanupComponent(componentPath);
    }
    this.componentRegistry.clear();
    this.endpoints.clear();
    this.registeredComponents.clear();
    console.log("[EndpointManager] Cleanup completed");
  }

  /**
   * Utility to check an endpoint’s /health endpoint
   */
  async checkEndpointHealth(endpoint, attempt = 1) {
    if (!endpoint) {
      console.error(
        "[EndpointManager] No endpoint provided to checkEndpointHealth"
      );
      return false;
    }
    try {
      console.log(
        `[EndpointManager] Checking health for ${endpoint.name} (attempt ${attempt}/3)`
      );
      const response = await fetch(`${endpoint.url}/health`);
      return response.ok;
    } catch (error) {
      console.error(
        `Health check failed for endpoint ${endpoint.name}:`,
        error
      );
      return false;
    }
  }
}
