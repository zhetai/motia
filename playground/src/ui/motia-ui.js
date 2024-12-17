// playground/src/ui/motia-ui.js
import { MotiaUi } from "motia/ui";

// Run glob in frontend environment
const modules = import.meta.glob("../workflows/**/components/**/ui.jsx", {
  eager: true,
});

console.log("MotiaUi object:", MotiaUi);

MotiaUi.registerNodeTypesFromGlob(modules);
console.log("Registered node types:", MotiaUi.getNodeTypes());

console.log("Registered node types:", MotiaUi.getNodeTypes());
