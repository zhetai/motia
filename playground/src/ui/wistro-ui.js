// playground/src/ui/wistro-ui.js
import { WistroUi } from "wistro/ui";

// Run glob in frontend environment
const modules = import.meta.glob("../workflows/**/components/**/ui.jsx", {
  eager: true,
});

WistroUi.registerNodeTypesFromGlob(modules);

// Export for use in other files
export { WistroUi };
