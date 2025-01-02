export class WistroUi {
  static nodeTypes = {};

  static registerNodeTypesFromGlob(modules) {
    const nodeTypes = {};
    for (const path in modules) {
      const match = path.match(/components\/([^/]+)\/ui\.jsx$/);
      if (match) {
        const componentId = match[1];
        nodeTypes[componentId] = modules[path].default;
      }
    }
    WistroUi.nodeTypes = { ...WistroUi.nodeTypes, ...nodeTypes };
  }

  static getNodeTypes() {
    return WistroUi.nodeTypes;
  }
}
