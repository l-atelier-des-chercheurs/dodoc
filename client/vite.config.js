import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue2 from "@vitejs/plugin-vue2";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import basicSsl from "@vitejs/plugin-basic-ssl";
import vueJsx from "@vitejs/plugin-vue2-jsx";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue2(),
    cssInjectedByJsPlugin(),
    basicSsl(),
    vueJsx(),
    visualizer({ open: true }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        `,
        api: "modern-compiler",
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    https: true,
    port: 5173,
    origin: "https://localhost:5173",
    cors: true,
  },
  build: {
    modulePreload: false,
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      input: "./src/main.js", // Specify your JS entry point here
      output: {
        entryFileNames: "build.js",
      },
    },
  },
});
