export class EndpointComponentDeployer {
  constructor(registry) {
    this.registry = registry;
  }

  async deployComponent(componentPath, code, componentId) {
    const component = this.registry.getComponentInfo(componentPath);
    if (!component) {
      throw new Error(`Component not found: ${componentPath}`);
    }

    const endpoint = this.registry.getEndpoint(component.endpoint);
    if (!endpoint) {
      throw new Error(`Endpoint not found: ${component.endpoint}`);
    }

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

    return response.json();
  }
}
