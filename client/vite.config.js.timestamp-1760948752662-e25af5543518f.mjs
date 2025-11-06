// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/vite/dist/node/index.js";
import vue2 from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/@vitejs/plugin-vue2/dist/index.mjs";
import cssInjectedByJsPlugin from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js";
import mkcert from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/vite-plugin-mkcert/dist/mkcert.mjs";
import vueJsx from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/@vitejs/plugin-vue2-jsx/dist/index.mjs";
import { visualizer } from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_import_meta_url = "file:///Users/louis/Documents/REPO/dodoc/client/vite.config.js";
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
  assetsInclude: ["**/*.svg"],
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
      output: [
        {
          format: "iife",
          entryFileNames: "bundle.js",
          globals: {
            vue: "Vue",
            "vue-router": "VueRouter"
          }
        },
        {
          format: "es",
          entryFileNames: "build.js"
        }
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbG91aXMvRG9jdW1lbnRzL1JFUE8vZG9kb2MvY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbG91aXMvRG9jdW1lbnRzL1JFUE8vZG9kb2MvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9sb3Vpcy9Eb2N1bWVudHMvUkVQTy9kb2RvYy9jbGllbnQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tIFwibm9kZTp1cmxcIjtcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB2dWUyIGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWUyXCI7XG5pbXBvcnQgY3NzSW5qZWN0ZWRCeUpzUGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1jc3MtaW5qZWN0ZWQtYnktanNcIjtcbmltcG9ydCBta2NlcnQgZnJvbSBcInZpdGUtcGx1Z2luLW1rY2VydFwiO1xuaW1wb3J0IHZ1ZUpzeCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlMi1qc3hcIjtcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHZ1ZTIoKSxcbiAgICBjc3NJbmplY3RlZEJ5SnNQbHVnaW4oKSxcbiAgICBta2NlcnQoKSxcbiAgICB2dWVKc3goKSxcbiAgICB2aXN1YWxpemVyKHsgb3BlbjogdHJ1ZSB9KSxcbiAgXSxcbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgc2Nzczoge1xuICAgICAgICBhZGRpdGlvbmFsRGF0YTogYFxuICAgICAgICAgIEB1c2UgXCJAL3V0aWxzL21peGlucy5zY3NzXCIgYXMgKjtcbiAgICAgICAgYCxcbiAgICAgICAgYXBpOiBcIm1vZGVybi1jb21waWxlclwiLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoXCIuL3NyY1wiLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgIFwiQG5vZGVfbW9kdWxlc1wiOiBmaWxlVVJMVG9QYXRoKFxuICAgICAgICBuZXcgVVJMKFwiLi9ub2RlX21vZHVsZXNcIiwgaW1wb3J0Lm1ldGEudXJsKVxuICAgICAgKSxcbiAgICB9LFxuICB9LFxuICBhc3NldHNJbmNsdWRlOiBbXCIqKi8qLnN2Z1wiXSxcbiAgc2VydmVyOiB7XG4gICAgaHR0cHM6IHRydWUsXG4gICAgcG9ydDogNTE3MyxcbiAgICBob3N0OiB0cnVlLFxuICAgIG9yaWdpbjogdW5kZWZpbmVkLFxuICAgIGNvcnM6IHtcbiAgICAgIG9yaWdpbjogXCIqXCIsXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBtb2R1bGVQcmVsb2FkOiBmYWxzZSxcbiAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgIGFzc2V0c0RpcjogXCJhc3NldHNcIixcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDogXCIuL3NyYy9tYWluLmpzXCIsXG4gICAgICBvdXRwdXQ6IFtcbiAgICAgICAge1xuICAgICAgICAgIGZvcm1hdDogXCJpaWZlXCIsXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiYnVuZGxlLmpzXCIsXG4gICAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgICAgdnVlOiBcIlZ1ZVwiLFxuICAgICAgICAgICAgXCJ2dWUtcm91dGVyXCI6IFwiVnVlUm91dGVyXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGZvcm1hdDogXCJlc1wiLFxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcImJ1aWxkLmpzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFMsU0FBUyxlQUFlLFdBQVc7QUFFN1UsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sMkJBQTJCO0FBQ2xDLE9BQU8sWUFBWTtBQUNuQixPQUFPLFlBQVk7QUFDbkIsU0FBUyxrQkFBa0I7QUFQNkosSUFBTSwyQ0FBMkM7QUFVek8sSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsc0JBQXNCO0FBQUEsSUFDdEIsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsV0FBVyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQUEsRUFDM0I7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILHFCQUFxQjtBQUFBLE1BQ25CLE1BQU07QUFBQSxRQUNKLGdCQUFnQjtBQUFBO0FBQUE7QUFBQSxRQUdoQixLQUFLO0FBQUEsTUFDUDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQ3BELGlCQUFpQjtBQUFBLFFBQ2YsSUFBSSxJQUFJLGtCQUFrQix3Q0FBZTtBQUFBLE1BQzNDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGVBQWUsQ0FBQyxVQUFVO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLE1BQ0osUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsSUFDZixRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsTUFDUCxRQUFRO0FBQUEsUUFDTjtBQUFBLFVBQ0UsUUFBUTtBQUFBLFVBQ1IsZ0JBQWdCO0FBQUEsVUFDaEIsU0FBUztBQUFBLFlBQ1AsS0FBSztBQUFBLFlBQ0wsY0FBYztBQUFBLFVBQ2hCO0FBQUEsUUFDRjtBQUFBLFFBQ0E7QUFBQSxVQUNFLFFBQVE7QUFBQSxVQUNSLGdCQUFnQjtBQUFBLFFBQ2xCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
