import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.WEB_BASE_PATH || "/",
  server: {
    proxy: { "/api": "http://localhost:3000" },
  },
});
