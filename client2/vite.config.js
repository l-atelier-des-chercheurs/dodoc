import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue2 from "@vitejs/plugin-vue2";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue2()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    port: 5173,
    origin: "http://localhost:5173",
    cors: true,
  },

  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
});
