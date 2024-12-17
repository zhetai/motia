import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
  optimizeDeps: {
    include: ["motia/ui"],
  },
});
