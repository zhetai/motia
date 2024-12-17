const modules = import.meta.glob("./workflows/**/components/**/ui.jsx", {
  eager: true,
});

const nodeTypes = {};
for (const path in modules) {
  const match = path.match(/components\/([^/]+)\/ui\.jsx$/);
  if (match) {
    const componentId = match[1];
    nodeTypes[componentId] = modules[path].default;
  }
}

export { nodeTypes };
