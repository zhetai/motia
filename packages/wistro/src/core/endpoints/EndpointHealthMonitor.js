export class EndpointHealthMonitor {
  constructor(registry) {
    this.registry = registry;
    this.interval = null;
  }

  async checkHealth(endpoint) {
    try {
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

  async start(checkInterval = 3000) {
    this.interval = setInterval(async () => {
      for (const [name, endpoint] of this.registry.endpoints) {
        const isHealthy = await this.checkHealth(endpoint);
        this.registry.updateEndpointStatus(
          name,
          isHealthy ? "ready" : "unhealthy"
        );
      }
    }, checkInterval);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
