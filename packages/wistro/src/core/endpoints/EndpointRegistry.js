export class EndpointRegistry {
  constructor() {
    this.endpoints = new Map();
    this.componentRegistry = new Map();
    this.registeredComponents = new Set();
  }

  registerEndpoint(name, config) {
    const endpoint = {
      name,
      url: config.url,
      runtime: config.runtime,
      status: "initializing",
    };
    this.endpoints.set(name, endpoint);
    return endpoint;
  }

  getEndpoint(name) {
    return this.endpoints.get(name);
  }

  updateEndpointStatus(name, status) {
    const endpoint = this.endpoints.get(name);
    if (endpoint) {
      endpoint.status = status;
    }
  }

  registerComponent(componentPath, endpointName, componentId) {
    const componentKey = `${endpointName}:${componentPath}`;
    this.componentRegistry.set(componentPath, {
      endpoint: endpointName,
      componentId,
    });
    this.registeredComponents.add(componentKey);
  }

  getComponentInfo(componentPath) {
    return this.componentRegistry.get(componentPath);
  }

  clear() {
    this.endpoints.clear();
    this.componentRegistry.clear();
    this.registeredComponents.clear();
  }
}
