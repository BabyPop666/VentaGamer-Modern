import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      // SignalR usa WebSocket: necesita ws:true para que Vite tunelee el upgrade.
      "/hubs": {
        target: "http://localhost:5050",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
