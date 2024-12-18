// playground/src/ui/motia-ui.js
import { MotiaUi } from "motia/ui";

// Run glob in frontend environment
const modules = import.meta.glob("../workflows/**/components/**/ui.jsx", {
  eager: true,
});

MotiaUi.registerNodeTypesFromGlob(modules);

// Export for use in other files
export { MotiaUi };
