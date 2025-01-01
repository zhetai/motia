import { EndpointRegistry } from "./EndpointRegistry.js";
import { EndpointHealthMonitor } from "./EndpointHealthMonitor.js";
import { EndpointComponentDeployer } from "./EndpointComponentDeployer.js";
import { EndpointComponentExecutor } from "./EndpointComponentExecutor.js";
import fs from "fs/promises";

export class EndpointManager {
  constructor(emitCallback) {
    this.registry = new EndpointRegistry();
    this.healthMonitor = new EndpointHealthMonitor(this.registry);
    this.deployer = new EndpointComponentDeployer(this.registry);
    this.executor = new EndpointComponentExecutor(this.registry, emitCallback);
    this.startupDelay = 50;
    this.maxRetries = 3;
    this.retryDelay = 50;
  }

  async initialize() {
    // Wait for initial delay
    await new Promise((resolve) => setTimeout(resolve, this.startupDelay));
    await this.healthMonitor.start();
  }

  async registerEndpoint(name, config) {
    console.log("[EndpointManager] Registering endpoint:", name, config);
    const endpoint = this.registry.registerEndpoint(name, config);

    // Wait for initial delay before first health check
    await new Promise((resolve) => setTimeout(resolve, this.startupDelay));

    // Attempt health checks with retries
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const isHealthy = await this.healthMonitor.checkHealth(endpoint);
        this.registry.updateEndpointStatus(
          name,
          isHealthy ? "ready" : "unhealthy"
        );

        if (isHealthy) {
          console.log(
            `[EndpointManager] Endpoint ${name} registered successfully`
          );
          return;
        }

        if (attempt < this.maxRetries) {
          console.log(
            `[EndpointManager] Retrying health check for ${name} (${attempt}/${this.maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        }
      } catch (error) {
        if (attempt === this.maxRetries) {
          throw new Error(
            `Failed to register endpoint ${name} after ${this.maxRetries} attempts`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      }
    }

    throw new Error(`Failed to register endpoint ${name}: health check failed`);
  }

  async registerComponent(componentPath, endpointName, componentId) {
    if (!endpointName || endpointName === "server") {
      console.log(
        `[EndpointManager] Skipping server-based component: ${componentId}`
      );
      return;
    }

    // Check if endpoint is ready
    const endpoint = this.registry.getEndpoint(endpointName);
    if (!endpoint || endpoint.status !== "ready") {
      console.log(
        `[EndpointManager] Waiting for endpoint ${endpointName} to be ready...`
      );
      await new Promise((resolve) => setTimeout(resolve, this.startupDelay));

      // Recheck endpoint status
      const updatedEndpoint = this.registry.getEndpoint(endpointName);
      if (!updatedEndpoint || updatedEndpoint.status !== "ready") {
        throw new Error(
          `Cannot register component: endpoint ${endpointName} not ready`
        );
      }
    }

    this.registry.registerComponent(componentPath, endpointName, componentId);
    const code = await fs.readFile(componentPath, "utf-8");

    // Attempt component deployment with retries
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.deployer.deployComponent(componentPath, code, componentId);
        console.log(
          `[EndpointManager] Component ${componentId} registered successfully`
        );
        return;
      } catch (error) {
        if (attempt === this.maxRetries) {
          throw new Error(
            `Failed to register component ${componentId} after ${this.maxRetries} attempts`
          );
        }
        console.log(
          `[EndpointManager] Retrying component registration for ${componentId} (${attempt}/${this.maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  async executeComponent(componentPath, event) {
    return this.executor.execute(componentPath, event);
  }

  async cleanup() {
    this.healthMonitor.stop();
    this.registry.clear();
  }
}
