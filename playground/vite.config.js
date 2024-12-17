import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
    hmr: {
      protocol: "ws",
      clientPort: 5173,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      motia: path.resolve(__dirname, "../packages/motia/src"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "motia/ui"],
    force: true,
  },
  build: {
    commonjsOptions: {
      include: [/motia/, /node_modules/],
    },
  },
});
