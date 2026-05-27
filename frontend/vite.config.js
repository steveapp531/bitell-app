import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // Point to local backend during development.
        // In production, VITE_API_URL in api.js takes over — proxy is dev-only.
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
