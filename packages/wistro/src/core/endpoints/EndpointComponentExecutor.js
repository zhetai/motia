export class EndpointComponentExecutor {
  constructor(registry, emitCallback) {
    this.registry = registry;
    this.emitCallback = emitCallback;
  }

  async execute(componentPath, event) {
    const component = this.registry.getComponentInfo(componentPath);
    if (!component) {
      throw new Error(`Component not found: ${componentPath}`);
    }

    const endpoint = this.registry.getEndpoint(component.endpoint);
    if (!endpoint || endpoint.status !== "ready") {
      throw new Error(`Endpoint ${component.endpoint} not ready`);
    }

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

    if (Array.isArray(result.events)) {
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
  }
}
