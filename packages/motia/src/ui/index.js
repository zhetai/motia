// packages/motia/src/ui/index.js
import { MotiaUi } from "./MotiaUi.js";
import { useMotiaFlow } from "./hooks/useMotiaFlow.js";

// Export as named exports
export { MotiaUi, useMotiaFlow };

// Also provide a default export if needed
export default {
  MotiaUi,
  useMotiaFlow,
};
