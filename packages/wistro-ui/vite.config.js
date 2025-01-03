import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      formats: ["es"],
      fileName: "ui",
    },
    outDir: "dist/browser",
    rollupOptions: {
      external: ["react", "react-dom", "reactflow"],
    },
  },
  plugins: [react()],
});
