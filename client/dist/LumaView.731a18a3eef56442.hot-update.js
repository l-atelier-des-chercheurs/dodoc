"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(typeof self !== 'undefined' ? self : this)["webpackHotUpdateapp"]("LumaView",{

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-37[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/views/LumaView.vue?vue&type=script&lang=js&":
/*!***********************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-37[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/views/LumaView.vue?vue&type=script&lang=js& ***!
  \***********************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  props: {},\n  components: {},\n  data() {\n    return {\n      path: \"folders\",\n      folders: undefined\n    };\n  },\n  created() {},\n  mounted() {\n    this.loadFolder();\n  },\n  beforeDestroy() {},\n  watch: {},\n  computed: {\n    first_folder() {\n      if (this.folders && this.folders.length > 0) return this.folders[0];\n      return false;\n    }\n  },\n  methods: {\n    async loadFolder() {\n      this.folders = await this.$api.getFolders({\n        path: this.path\n      }).catch(err => {\n        this.fetch_spaces_error = err.response;\n        // this.is_loading = false;\n        return;\n      });\n      if (this.folders.length === 0) {\n        await this.createFolder();\n        window.location.reload();\n      }\n      this.$api.join({\n        room: this.path\n      });\n    },\n    async createFolder() {\n      try {\n        const new_space_slug = await this.$api.createFolder({\n          path: this.path\n        });\n        return new_space_slug;\n      } catch (err) {\n        // this.error_msg = \"Error: \" + err.message;\n        // setTimeout(() => {\n        //   this.error_msg = \"\";\n        // }, 5000);\n        // this.is_creating_project = false;\n      }\n    }\n  }\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvYmFiZWwtbG9hZGVyL2xpYi9pbmRleC5qcz8/Y2xvbmVkUnVsZVNldC0zN1swXS5ydWxlc1swXS51c2VbMF0hLi9ub2RlX21vZHVsZXMvQHZ1ZS92dWUtbG9hZGVyLXYxNS9saWIvaW5kZXguanM/P3Z1ZS1sb2FkZXItb3B0aW9ucyEuL3NyYy92aWV3cy9MdW1hVmlldy52dWU/dnVlJnR5cGU9c2NyaXB0Jmxhbmc9anMmLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFFQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hcHAvc3JjL3ZpZXdzL0x1bWFWaWV3LnZ1ZT83MDc1Il0sInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cbiAgPGRpdj5cbiAgICA8IS0tIC8vIGlkZW50aWZpZXotdm91cyAgLS0+XG4gICAgPCEtLSAvLyB1bmUgZm9pcyBpZGVudGlmacOpLCBhY2PDqHMgw6Agc29uIGNodXRpZXIgLS0+XG4gICAgPCEtLSAvLyArIGFjY8OocyBhdSBsb3QgY29tbXVuIC0tPlxuICAgIDxMb2FkZXJTcGlubmVyIHYtaWY9XCIhZmlyc3RfZm9sZGVyXCIgLz5cbiAgICA8ZGl2IHYtZWxzZT5cbiAgICAgIHt7IGZpcnN0X2ZvbGRlciB9fVxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbjwvdGVtcGxhdGU+XG48c2NyaXB0PlxuZXhwb3J0IGRlZmF1bHQge1xuICBwcm9wczoge30sXG4gIGNvbXBvbmVudHM6IHt9LFxuICBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwYXRoOiBcImZvbGRlcnNcIixcbiAgICAgIGZvbGRlcnM6IHVuZGVmaW5lZCxcbiAgICB9O1xuICB9LFxuICBjcmVhdGVkKCkge30sXG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy5sb2FkRm9sZGVyKCk7XG4gIH0sXG4gIGJlZm9yZURlc3Ryb3koKSB7fSxcbiAgd2F0Y2g6IHt9LFxuICBjb21wdXRlZDoge1xuICAgIGZpcnN0X2ZvbGRlcigpIHtcbiAgICAgIGlmICh0aGlzLmZvbGRlcnMgJiYgdGhpcy5mb2xkZXJzLmxlbmd0aCA+IDApIHJldHVybiB0aGlzLmZvbGRlcnNbMF07XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIGFzeW5jIGxvYWRGb2xkZXIoKSB7XG4gICAgICB0aGlzLmZvbGRlcnMgPSBhd2FpdCB0aGlzLiRhcGlcbiAgICAgICAgLmdldEZvbGRlcnMoe1xuICAgICAgICAgIHBhdGg6IHRoaXMucGF0aCxcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICB0aGlzLmZldGNoX3NwYWNlc19lcnJvciA9IGVyci5yZXNwb25zZTtcbiAgICAgICAgICAvLyB0aGlzLmlzX2xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMuZm9sZGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVGb2xkZXIoKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRhcGkuam9pbih7IHJvb206IHRoaXMucGF0aCB9KTtcbiAgICB9LFxuICAgIGFzeW5jIGNyZWF0ZUZvbGRlcigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG5ld19zcGFjZV9zbHVnID0gYXdhaXQgdGhpcy4kYXBpLmNyZWF0ZUZvbGRlcih7XG4gICAgICAgICAgcGF0aDogdGhpcy5wYXRoLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ld19zcGFjZV9zbHVnO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIHRoaXMuZXJyb3JfbXNnID0gXCJFcnJvcjogXCIgKyBlcnIubWVzc2FnZTtcbiAgICAgICAgLy8gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vICAgdGhpcy5lcnJvcl9tc2cgPSBcIlwiO1xuICAgICAgICAvLyB9LCA1MDAwKTtcbiAgICAgICAgLy8gdGhpcy5pc19jcmVhdGluZ19wcm9qZWN0ID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcbiAgfSxcbn07XG48L3NjcmlwdD5cbjxzdHlsZSBsYW5nPVwic2Nzc1wiIHNjb3BlZD48L3N0eWxlPlxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./node_modules/babel-loader/lib/index.js??clonedRuleSet-37[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/views/LumaView.vue?vue&type=script&lang=js&\n");

/***/ })

});