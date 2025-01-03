// packages/wistro/src/index.js
import { WistroUi } from "./WistroUi.js";
import { useWistroFlow } from "./hooks/useWistroFlow.js";

// Export as named exports
export { WistroUi, useWistroFlow };

// Also provide a default export if needed
export default {
  WistroUi,
  useWistroFlow,
};
