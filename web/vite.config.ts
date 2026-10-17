import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode, command }) => {
  // These server-only settings are not exposed through import.meta.env in the client.
  const env = loadEnv(mode, process.cwd(), "");
  const cert = env.WEB_DEV_TLS_CERT;
  const key = env.WEB_DEV_TLS_KEY;
  if (command === "serve" && Boolean(cert) !== Boolean(key)) {
    throw new Error("Set both WEB_DEV_TLS_CERT and WEB_DEV_TLS_KEY for local HTTPS.");
  }
  return {
    plugins: [react()],
    base: env.WEB_BASE_PATH || "/",
    server: {
      host: env.WEB_DEV_HOST || "localhost",
      port: 5173,
      strictPort: true,
      https: command === "serve" && cert && key ? {
        cert: readFileSync(resolve(cert)),
        key: readFileSync(resolve(key)),
      } : undefined,
      proxy: { "/api": env.WEB_DEV_API_TARGET || "http://127.0.0.1:3000" },
    },
  };
});
