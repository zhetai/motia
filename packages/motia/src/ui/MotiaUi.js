export class MotiaUi {
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
    MotiaUi.nodeTypes = { ...MotiaUi.nodeTypes, ...nodeTypes };
    console.log("MotiaUi bootstrap completed. NodeTypes:", MotiaUi.nodeTypes);
  }

  static getNodeTypes() {
    return MotiaUi.nodeTypes;
  }
}
