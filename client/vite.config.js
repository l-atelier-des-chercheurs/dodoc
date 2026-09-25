import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue2 from "@vitejs/plugin-vue2";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import mkcert from "vite-plugin-mkcert";
import vueJsx from "@vitejs/plugin-vue2-jsx";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue2(), cssInjectedByJsPlugin(), mkcert(), vueJsx()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/utils/mixins.scss" as *;
        `,
        api: "modern-compiler",
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@node_modules": fileURLToPath(
        new URL("./node_modules", import.meta.url)
      ),
    },
  },
  assetsInclude: ["**/*.svg"],
  server: {
    https: true,
    port: 5173,
    host: true,
    origin: undefined,
    cors: {
      origin: "*",
    },
  },
  build: {
    modulePreload: false,
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      input: "./src/main.js",
      output: [
        {
          format: "iife",
          entryFileNames: "bundle.js",
          globals: {
            vue: "Vue",
            "vue-router": "VueRouter",
          },
        },
        {
          format: "es",
          entryFileNames: "build.js",
          plugins: [visualizer({ filename: "stats.html", open: true })],
        },
      ],
    },
  },
});
