// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/vite/dist/node/index.js";
import vue2 from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/@vitejs/plugin-vue2/dist/index.mjs";
import cssInjectedByJsPlugin from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js";
import basicSsl from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/@vitejs/plugin-basic-ssl/dist/index.mjs";
import vueJsx from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/@vitejs/plugin-vue2-jsx/dist/index.mjs";
import { visualizer } from "file:///Users/louis/Documents/REPO/dodoc/client/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_import_meta_url = "file:///Users/louis/Documents/REPO/dodoc/client/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [
    vue2(),
    cssInjectedByJsPlugin(),
    basicSsl(),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbG91aXMvRG9jdW1lbnRzL1JFUE8vZG9kb2MvY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbG91aXMvRG9jdW1lbnRzL1JFUE8vZG9kb2MvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9sb3Vpcy9Eb2N1bWVudHMvUkVQTy9kb2RvYy9jbGllbnQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tIFwibm9kZTp1cmxcIjtcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB2dWUyIGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWUyXCI7XG5pbXBvcnQgY3NzSW5qZWN0ZWRCeUpzUGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1jc3MtaW5qZWN0ZWQtYnktanNcIjtcbmltcG9ydCBiYXNpY1NzbCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tYmFzaWMtc3NsXCI7XG5pbXBvcnQgdnVlSnN4IGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWUyLWpzeFwiO1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlMigpLFxuICAgIGNzc0luamVjdGVkQnlKc1BsdWdpbigpLFxuICAgIGJhc2ljU3NsKCksXG4gICAgdnVlSnN4KCksXG4gICAgdmlzdWFsaXplcih7IG9wZW46IHRydWUgfSksXG4gIF0sXG4gIGNzczoge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgYWRkaXRpb25hbERhdGE6IGBcbiAgICAgICAgICBAdXNlIFwiQC91dGlscy9taXhpbnMuc2Nzc1wiIGFzICo7XG4gICAgICAgIGAsXG4gICAgICAgIGFwaTogXCJtb2Rlcm4tY29tcGlsZXJcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9zcmNcIiwgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICBcIkBub2RlX21vZHVsZXNcIjogZmlsZVVSTFRvUGF0aChcbiAgICAgICAgbmV3IFVSTChcIi4vbm9kZV9tb2R1bGVzXCIsIGltcG9ydC5tZXRhLnVybClcbiAgICAgICksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgaHR0cHM6IHRydWUsXG4gICAgcG9ydDogNTE3MyxcbiAgICBob3N0OiB0cnVlLFxuICAgIG9yaWdpbjogdW5kZWZpbmVkLFxuICAgIGNvcnM6IHtcbiAgICAgIG9yaWdpbjogXCIqXCIsXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBtb2R1bGVQcmVsb2FkOiBmYWxzZSxcbiAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgIGFzc2V0c0RpcjogXCJhc3NldHNcIixcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDogXCIuL3NyYy9tYWluLmpzXCIsIC8vIFNwZWNpZnkgeW91ciBKUyBlbnRyeSBwb2ludCBoZXJlXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiYnVpbGQuanNcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwUyxTQUFTLGVBQWUsV0FBVztBQUU3VSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFVBQVU7QUFDakIsT0FBTywyQkFBMkI7QUFDbEMsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sWUFBWTtBQUNuQixTQUFTLGtCQUFrQjtBQVA2SixJQUFNLDJDQUEyQztBQVV6TyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxzQkFBc0I7QUFBQSxJQUN0QixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxXQUFXLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFBQSxFQUMzQjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gscUJBQXFCO0FBQUEsTUFDbkIsTUFBTTtBQUFBLFFBQ0osZ0JBQWdCO0FBQUE7QUFBQTtBQUFBLFFBR2hCLEtBQUs7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsTUFDcEQsaUJBQWlCO0FBQUEsUUFDZixJQUFJLElBQUksa0JBQWtCLHdDQUFlO0FBQUEsTUFDM0M7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLE1BQ0osUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsSUFDZixRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUE7QUFBQSxNQUNQLFFBQVE7QUFBQSxRQUNOLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
