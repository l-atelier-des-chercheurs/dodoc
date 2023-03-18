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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _adc_core_author_AuthorList_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/adc-core/author/AuthorList.vue */ \"./src/adc-core/author/AuthorList.vue\");\n/* harmony import */ var _components_MyChutier_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MyChutier.vue */ \"./src/components/MyChutier.vue\");\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  props: {},\n  components: {\n    AuthorList: _adc_core_author_AuthorList_vue__WEBPACK_IMPORTED_MODULE_0__[\"default\"],\n    MyChutier: _components_MyChutier_vue__WEBPACK_IMPORTED_MODULE_1__[\"default\"]\n  },\n  data() {\n    return {\n      path: \"folders\",\n      folders: undefined,\n      show_authors_modal: true\n    };\n  },\n  created() {},\n  mounted() {\n    this.loadFolder();\n  },\n  beforeDestroy() {},\n  watch: {\n    connected_as() {\n      // if (this.connected_as) {\n      // this.show_authors_modal = false;\n      // }\n    }\n  },\n  computed: {\n    first_folder() {\n      if (this.folders && this.folders.length > 0) return this.folders[0];\n      return false;\n    }\n  },\n  methods: {\n    async loadFolder() {\n      this.folders = await this.$api.getFolders({\n        path: this.path\n      }).catch(err => {\n        this.fetch_spaces_error = err.response;\n        // this.is_loading = false;\n        return;\n      });\n      if (this.folders.length === 0) {\n        await this.createFolder();\n        window.location.reload();\n      }\n      this.$api.join({\n        room: this.path\n      });\n    },\n    async createFolder() {\n      try {\n        const new_space_slug = await this.$api.createFolder({\n          path: this.path\n        });\n        return new_space_slug;\n      } catch (err) {\n        // this.error_msg = \"Error: \" + err.message;\n        // setTimeout(() => {\n        //   this.error_msg = \"\";\n        // }, 5000);\n        // this.is_creating_project = false;\n      }\n    },\n    showAuthorModal() {\n      this.show_authors_modal = true;\n    }\n  }\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvYmFiZWwtbG9hZGVyL2xpYi9pbmRleC5qcz8/Y2xvbmVkUnVsZVNldC0zN1swXS5ydWxlc1swXS51c2VbMF0hLi9ub2RlX21vZHVsZXMvQHZ1ZS92dWUtbG9hZGVyLXYxNS9saWIvaW5kZXguanM/P3Z1ZS1sb2FkZXItb3B0aW9ucyEuL3NyYy92aWV3cy9MdW1hVmlldy52dWU/dnVlJnR5cGU9c2NyaXB0Jmxhbmc9anMmLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQThCQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hcHAvc3JjL3ZpZXdzL0x1bWFWaWV3LnZ1ZT83MDc1Il0sInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cbiAgPGRpdj5cbiAgICA8IS0tIC8vIGlkZW50aWZpZXotdm91cyAgLS0+XG4gICAgPCEtLSAvLyB1bmUgZm9pcyBpZGVudGlmacOpLCBhY2PDqHMgw6Agc29uIGNodXRpZXIgLS0+XG4gICAgPCEtLSAvLyArIGFjY8OocyBhdSBsb3QgY29tbXVuIC0tPlxuICAgIDxMb2FkZXJTcGlubmVyIHYtaWY9XCIhZmlyc3RfZm9sZGVyXCIgLz5cbiAgICA8ZGl2IHYtZWxzZT5cbiAgICAgIDxzZWN0aW9uIGNsYXNzPVwiX215Q29udGVudFwiPlxuICAgICAgICA8QXV0aG9yTGlzdFxuICAgICAgICAgIHYtaWY9XCJzaG93X2F1dGhvcnNfbW9kYWxcIlxuICAgICAgICAgIEBjbG9zZT1cInNob3dfYXV0aG9yc19tb2RhbCA9IGZhbHNlXCJcbiAgICAgICAgLz5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiX3N1YnNjcmliZUJ0blwiPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiX2F1dGhvckJ0blwiIEBjbGljaz1cInNob3dBdXRob3JNb2RhbFwiPlxuICAgICAgICAgICAgPHRlbXBsYXRlIHYtaWY9XCJjb25uZWN0ZWRfYXNcIj5cbiAgICAgICAgICAgICAge3sgY29ubmVjdGVkX2FzLm5hbWUgfX1cbiAgICAgICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICAgICAgICA8dGVtcGxhdGUgdi1lbHNlPnt7ICR0KFwibG9naW5cIikgfX08L3RlbXBsYXRlPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IHYtaWY9XCJjb25uZWN0ZWRfYXNcIj5cbiAgICAgICAgICA8TXlDaHV0aWVyIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbjwvdGVtcGxhdGU+XG48c2NyaXB0PlxuaW1wb3J0IEF1dGhvckxpc3QgZnJvbSBcIkAvYWRjLWNvcmUvYXV0aG9yL0F1dGhvckxpc3QudnVlXCI7XG5pbXBvcnQgTXlDaHV0aWVyIGZyb20gXCJAL2NvbXBvbmVudHMvTXlDaHV0aWVyLnZ1ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHByb3BzOiB7fSxcbiAgY29tcG9uZW50czoge1xuICAgIEF1dGhvckxpc3QsXG4gICAgTXlDaHV0aWVyLFxuICB9LFxuICBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwYXRoOiBcImZvbGRlcnNcIixcbiAgICAgIGZvbGRlcnM6IHVuZGVmaW5lZCxcbiAgICAgIHNob3dfYXV0aG9yc19tb2RhbDogdHJ1ZSxcbiAgICB9O1xuICB9LFxuICBjcmVhdGVkKCkge30sXG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy5sb2FkRm9sZGVyKCk7XG4gIH0sXG4gIGJlZm9yZURlc3Ryb3koKSB7fSxcbiAgd2F0Y2g6IHtcbiAgICBjb25uZWN0ZWRfYXMoKSB7XG4gICAgICAvLyBpZiAodGhpcy5jb25uZWN0ZWRfYXMpIHtcbiAgICAgIC8vIHRoaXMuc2hvd19hdXRob3JzX21vZGFsID0gZmFsc2U7XG4gICAgICAvLyB9XG4gICAgfSxcbiAgfSxcbiAgY29tcHV0ZWQ6IHtcbiAgICBmaXJzdF9mb2xkZXIoKSB7XG4gICAgICBpZiAodGhpcy5mb2xkZXJzICYmIHRoaXMuZm9sZGVycy5sZW5ndGggPiAwKSByZXR1cm4gdGhpcy5mb2xkZXJzWzBdO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBhc3luYyBsb2FkRm9sZGVyKCkge1xuICAgICAgdGhpcy5mb2xkZXJzID0gYXdhaXQgdGhpcy4kYXBpXG4gICAgICAgIC5nZXRGb2xkZXJzKHtcbiAgICAgICAgICBwYXRoOiB0aGlzLnBhdGgsXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgdGhpcy5mZXRjaF9zcGFjZXNfZXJyb3IgPSBlcnIucmVzcG9uc2U7XG4gICAgICAgICAgLy8gdGhpcy5pc19sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9KTtcbiAgICAgIGlmICh0aGlzLmZvbGRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuY3JlYXRlRm9sZGVyKCk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy4kYXBpLmpvaW4oeyByb29tOiB0aGlzLnBhdGggfSk7XG4gICAgfSxcbiAgICBhc3luYyBjcmVhdGVGb2xkZXIoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBuZXdfc3BhY2Vfc2x1ZyA9IGF3YWl0IHRoaXMuJGFwaS5jcmVhdGVGb2xkZXIoe1xuICAgICAgICAgIHBhdGg6IHRoaXMucGF0aCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdfc3BhY2Vfc2x1ZztcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyB0aGlzLmVycm9yX21zZyA9IFwiRXJyb3I6IFwiICsgZXJyLm1lc3NhZ2U7XG4gICAgICAgIC8vIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAvLyAgIHRoaXMuZXJyb3JfbXNnID0gXCJcIjtcbiAgICAgICAgLy8gfSwgNTAwMCk7XG4gICAgICAgIC8vIHRoaXMuaXNfY3JlYXRpbmdfcHJvamVjdCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2hvd0F1dGhvck1vZGFsKCkge1xuICAgICAgdGhpcy5zaG93X2F1dGhvcnNfbW9kYWwgPSB0cnVlO1xuICAgIH0sXG4gIH0sXG59O1xuPC9zY3JpcHQ+XG48c3R5bGUgbGFuZz1cInNjc3NcIiBzY29wZWQ+XG4uX215Q29udGVudCB7XG4gIHdpZHRoOiAzNTBweDtcbiAgaGVpZ2h0OiAxMDAlO1xuICBiYWNrZ3JvdW5kOiB3aGl0ZTtcbn1cbjwvc3R5bGU+XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/babel-loader/lib/index.js??clonedRuleSet-37[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/views/LumaView.vue?vue&type=script&lang=js&\n");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/sass-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/views/LumaView.vue?vue&type=style&index=0&id=0881f348&lang=scss&scoped=true&":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/sass-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/views/LumaView.vue?vue&type=style&index=0&id=0881f348&lang=scss&scoped=true& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/noSourceMaps.js */ \"./node_modules/css-loader/dist/runtime/noSourceMaps.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);\n// Imports\n\n\nvar ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \"._myContent[data-v-0881f348] {\\n  width: 350px;\\n  height: 100%;\\n  background: white;\\n}\", \"\"]);\n// Exports\n/* harmony default export */ __webpack_exports__[\"default\"] = (___CSS_LOADER_EXPORT___);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcz8/Y2xvbmVkUnVsZVNldC0xOVswXS5ydWxlc1swXS51c2VbMV0hLi9ub2RlX21vZHVsZXMvQHZ1ZS92dWUtbG9hZGVyLXYxNS9saWIvbG9hZGVycy9zdHlsZVBvc3RMb2FkZXIuanMhLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanM/P2Nsb25lZFJ1bGVTZXQtMTlbMF0ucnVsZXNbMF0udXNlWzJdIS4vbm9kZV9tb2R1bGVzL3Nhc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9jbG9uZWRSdWxlU2V0LTE5WzBdLnJ1bGVzWzBdLnVzZVszXSEuL25vZGVfbW9kdWxlcy9AdnVlL3Z1ZS1sb2FkZXItdjE1L2xpYi9pbmRleC5qcz8/dnVlLWxvYWRlci1vcHRpb25zIS4vc3JjL3ZpZXdzL0x1bWFWaWV3LnZ1ZT92dWUmdHlwZT1zdHlsZSZpbmRleD0wJmlkPTA4ODFmMzQ4Jmxhbmc9c2NzcyZzY29wZWQ9dHJ1ZSYuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXBwLy4vc3JjL3ZpZXdzL0x1bWFWaWV3LnZ1ZT80ZjYyIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9OT19TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvbm9Tb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfTk9fU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIuX215Q29udGVudFtkYXRhLXYtMDg4MWYzNDhdIHtcXG4gIHdpZHRoOiAzNTBweDtcXG4gIGhlaWdodDogMTAwJTtcXG4gIGJhY2tncm91bmQ6IHdoaXRlO1xcbn1cIiwgXCJcIl0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/@vue/vue-loader-v15/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/sass-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/views/LumaView.vue?vue&type=style&index=0&id=0881f348&lang=scss&scoped=true&\n");

/***/ })

});