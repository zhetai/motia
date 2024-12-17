const modules = import.meta.glob("/src/workflows/**/components/**/ui.jsx", {
  eager: true,
});

console.log("Found modules:", modules);

const nodeTypes = {};
for (const path in modules) {
  const match = path.match(/components\/([^/]+)\/ui\.jsx$/);
  if (match) {
    const componentId = match[1];
    console.log("Registering component:", componentId);
    nodeTypes[componentId] = modules[path].default;
  }
}

export { nodeTypes };
