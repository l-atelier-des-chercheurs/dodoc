// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///Users/louis/Documents/REPO/LUMA/client/node_modules/vite/dist/node/index.js";
import vue2 from "file:///Users/louis/Documents/REPO/LUMA/client/node_modules/@vitejs/plugin-vue2/dist/index.mjs";
import cssInjectedByJsPlugin from "file:///Users/louis/Documents/REPO/LUMA/client/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js";
import mkcert from "file:///Users/louis/Documents/REPO/LUMA/client/node_modules/vite-plugin-mkcert/dist/mkcert.mjs";
import vueJsx from "file:///Users/louis/Documents/REPO/LUMA/client/node_modules/@vitejs/plugin-vue2-jsx/dist/index.mjs";
import { visualizer } from "file:///Users/louis/Documents/REPO/LUMA/client/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_import_meta_url = "file:///Users/louis/Documents/REPO/LUMA/client/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [
    vue2(),
    cssInjectedByJsPlugin(),
    mkcert(),
    vueJsx(),
    visualizer({ open: true })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/utils/mixins.scss" as *;
        `,
        api: "modern-compiler"
      }
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "@node_modules": fileURLToPath(
        new URL("./node_modules", __vite_injected_original_import_meta_url)
      )
    }
  },
  server: {
    https: true,
    port: 5173,
    host: true,
    origin: void 0,
    cors: {
      origin: "*"
    }
  },
  build: {
    modulePreload: false,
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      input: "./src/main.js",
      // Specify your JS entry point here
      output: {
        entryFileNames: "build.js"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbG91aXMvRG9jdW1lbnRzL1JFUE8vTFVNQS9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9sb3Vpcy9Eb2N1bWVudHMvUkVQTy9MVU1BL2NsaWVudC92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbG91aXMvRG9jdW1lbnRzL1JFUE8vTFVNQS9jbGllbnQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tIFwibm9kZTp1cmxcIjtcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB2dWUyIGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWUyXCI7XG5pbXBvcnQgY3NzSW5qZWN0ZWRCeUpzUGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1jc3MtaW5qZWN0ZWQtYnktanNcIjtcbmltcG9ydCBta2NlcnQgZnJvbSBcInZpdGUtcGx1Z2luLW1rY2VydFwiO1xuaW1wb3J0IHZ1ZUpzeCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlMi1qc3hcIjtcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHZ1ZTIoKSxcbiAgICBjc3NJbmplY3RlZEJ5SnNQbHVnaW4oKSxcbiAgICBta2NlcnQoKSxcbiAgICB2dWVKc3goKSxcbiAgICB2aXN1YWxpemVyKHsgb3BlbjogdHJ1ZSB9KSxcbiAgXSxcbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgc2Nzczoge1xuICAgICAgICBhZGRpdGlvbmFsRGF0YTogYFxuICAgICAgICAgIEB1c2UgXCJAL3V0aWxzL21peGlucy5zY3NzXCIgYXMgKjtcbiAgICAgICAgYCxcbiAgICAgICAgYXBpOiBcIm1vZGVybi1jb21waWxlclwiLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoXCIuL3NyY1wiLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgIFwiQG5vZGVfbW9kdWxlc1wiOiBmaWxlVVJMVG9QYXRoKFxuICAgICAgICBuZXcgVVJMKFwiLi9ub2RlX21vZHVsZXNcIiwgaW1wb3J0Lm1ldGEudXJsKVxuICAgICAgKSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBodHRwczogdHJ1ZSxcbiAgICBwb3J0OiA1MTczLFxuICAgIGhvc3Q6IHRydWUsXG4gICAgb3JpZ2luOiB1bmRlZmluZWQsXG4gICAgY29yczoge1xuICAgICAgb3JpZ2luOiBcIipcIixcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIG1vZHVsZVByZWxvYWQ6IGZhbHNlLFxuICAgIG91dERpcjogXCJkaXN0XCIsXG4gICAgYXNzZXRzRGlyOiBcImFzc2V0c1wiLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiBcIi4vc3JjL21haW4uanNcIiwgLy8gU3BlY2lmeSB5b3VyIEpTIGVudHJ5IHBvaW50IGhlcmVcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJidWlsZC5qc1wiLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVTLFNBQVMsZUFBZSxXQUFXO0FBRTFVLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sVUFBVTtBQUNqQixPQUFPLDJCQUEyQjtBQUNsQyxPQUFPLFlBQVk7QUFDbkIsT0FBTyxZQUFZO0FBQ25CLFNBQVMsa0JBQWtCO0FBUDJKLElBQU0sMkNBQTJDO0FBVXZPLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLHNCQUFzQjtBQUFBLElBQ3RCLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFdBQVcsRUFBRSxNQUFNLEtBQUssQ0FBQztBQUFBLEVBQzNCO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUEsUUFDSixnQkFBZ0I7QUFBQTtBQUFBO0FBQUEsUUFHaEIsS0FBSztBQUFBLE1BQ1A7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxNQUNwRCxpQkFBaUI7QUFBQSxRQUNmLElBQUksSUFBSSxrQkFBa0Isd0NBQWU7QUFBQSxNQUMzQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixNQUFNO0FBQUEsTUFDSixRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxJQUNmLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQTtBQUFBLE1BQ1AsUUFBUTtBQUFBLFFBQ04sZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
