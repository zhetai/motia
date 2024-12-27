import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
    hmr: {
      protocol: "ws",
      clientPort: 5173,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      wistro: path.resolve(__dirname, "../packages/wistro/src"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "wistro/ui"],
    force: true,
  },
  build: {
    commonjsOptions: {
      include: [/wistro/, /node_modules/],
    },
  },
});
