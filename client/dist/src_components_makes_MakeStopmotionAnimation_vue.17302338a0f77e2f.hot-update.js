"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(typeof self !== 'undefined' ? self : this)["webpackHotUpdateapp"]("src_components_makes_MakeStopmotionAnimation_vue",{

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/makes/MakeStopmotionAnimation.vue?vue&type=script&lang=js":
/*!************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/makes/MakeStopmotionAnimation.vue?vue&type=script&lang=js ***!
  \************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var core_js_modules_es_array_push_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.push.js */ \"./node_modules/core-js/modules/es.array.push.js\");\n/* harmony import */ var core_js_modules_es_array_push_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_push_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_publications_modules_ModuleCreator_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/publications/modules/ModuleCreator.vue */ \"./src/components/publications/modules/ModuleCreator.vue\");\n/* harmony import */ var _components_makes_StopmotionModule_vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/makes/StopmotionModule.vue */ \"./src/components/makes/StopmotionModule.vue\");\n/* harmony import */ var _components_makes_ExportSaveMakeModal2_vue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/components/makes/ExportSaveMakeModal2.vue */ \"./src/components/makes/ExportSaveMakeModal2.vue\");\n\n\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  props: {\n    make: Object\n  },\n  components: {\n    ModuleCreator: _components_publications_modules_ModuleCreator_vue__WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n    StopmotionModule: _components_makes_StopmotionModule_vue__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n    ExportSaveMakeModal2: _components_makes_ExportSaveMakeModal2_vue__WEBPACK_IMPORTED_MODULE_3__[\"default\"]\n  },\n  data() {\n    return {\n      show_render_modal: false,\n      is_exporting: false,\n      created_video: false,\n      export_href: undefined,\n      frame_rate: this.make.frame_rate || 4,\n      custom_resolution_width: 1920,\n      custom_resolution_height: 1080,\n      resolution_preset_picked: \"original\"\n    };\n  },\n  async created() {\n    if (!this.sections || this.sections.length === 0) {\n      await this.createSection2({\n        publication: this.make,\n        type: \"section\",\n        group: \"sections_list\",\n        title: \"stopmotion\"\n      });\n    }\n  },\n  mounted() {},\n  beforeDestroy() {},\n  watch: {\n    first_media: {\n      handler() {\n        if (!this.first_media?.$infos) return;\n        const {\n          width,\n          height\n        } = this.first_media.$infos;\n        if (width && height) {\n          this.custom_resolution_width = width;\n          this.custom_resolution_height = height;\n        }\n      },\n      immediate: true\n    },\n    \"make.frame_rate\": {\n      handler() {\n        this.frame_rate = this.make.frame_rate;\n      },\n      immediate: true\n    }\n  },\n  computed: {\n    possible_formats() {\n      return [{\n        key: \"mp4\",\n        text: this.$t(\"video_mp4\")\n      }, {\n        key: \"gif\",\n        text: this.$t(\"video_gif\")\n      }];\n    },\n    export_is_available() {\n      return this.section_modules_list.length > 0;\n    },\n    sections() {\n      return this.getSectionsWithProps({\n        publication: this.make,\n        group: \"sections_list\"\n      });\n    },\n    first_section() {\n      return this.sections.at(0);\n    },\n    first_media() {\n      if (this.section_modules_list.length > 0) {\n        const first_module = this.section_modules_list.at(0);\n        return this.firstMedia(first_module);\n      }\n      return undefined;\n    },\n    section_modules_list() {\n      return this.getModulesForSection({\n        publication: this.make,\n        section: this.first_section\n      }).map(({\n        _module\n      }) => _module);\n    },\n    first_media_ratio() {\n      return this.first_media?.$infos?.ratio || undefined;\n    },\n    base_instructions() {\n      const recipe = \"stopmotion_animation\";\n      const images_meta = this.section_modules_list.reduce((acc, m) => {\n        const meta_filename_in_project = m.source_medias[0]?.meta_filename_in_project;\n        if (meta_filename_in_project) {\n          acc.push({\n            m: meta_filename_in_project,\n            d: 1\n          });\n        }\n        return acc;\n      }, []);\n      return {\n        recipe,\n        images_meta,\n        frame_rate: this.frame_rate\n      };\n    }\n  },\n  methods: {\n    async addModules({\n      meta_filenames\n    }) {\n      await this.insertModuleMetaFilenamesToList2({\n        publication: this.make,\n        section: this.first_section,\n        meta_filenames\n      });\n    },\n    async insertModules({\n      meta_filenames,\n      index\n    }) {\n      await this.insertModuleMetaFilenamesToList2({\n        publication: this.make,\n        section: this.first_section,\n        index,\n        meta_filenames\n      });\n    },\n    async moveModuleTo({\n      path,\n      new_position\n    }) {\n      await this.moveModuleTo2({\n        publication: this.make,\n        section: this.first_section,\n        meta_filename: this.getFilename(path),\n        new_position\n      });\n    },\n    async removeModule(path) {\n      await this.removeModule2({\n        publication: this.make,\n        section: this.first_section,\n        path\n      });\n    },\n    updateFrameRate(frame_rate) {\n      this.$api.updateMeta({\n        path: this.make.$path,\n        new_meta: {\n          frame_rate\n        }\n      });\n    }\n  }\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvYmFiZWwtbG9hZGVyL2xpYi9pbmRleC5qcz8/Y2xvbmVkUnVsZVNldC00MC51c2VbMF0hLi9ub2RlX21vZHVsZXMvQHZ1ZS92dWUtbG9hZGVyLXYxNS9saWIvaW5kZXguanM/P3Z1ZS1sb2FkZXItb3B0aW9ucyEuL3NyYy9jb21wb25lbnRzL21ha2VzL01ha2VTdG9wbW90aW9uQW5pbWF0aW9uLnZ1ZT92dWUmdHlwZT1zY3JpcHQmbGFuZz1qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBbUhBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXBwL3NyYy9jb21wb25lbnRzL21ha2VzL01ha2VTdG9wbW90aW9uQW5pbWF0aW9uLnZ1ZT82ZWUyIl0sInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cbiAgPGRpdj5cbiAgICA8dHJhbnNpdGlvbi1ncm91cFxuICAgICAgdGFnPVwiZGl2XCJcbiAgICAgIGNsYXNzPVwiX2xpc3RPZk1vZHVsZXNcIlxuICAgICAgbmFtZT1cIlN0b3J5TW9kdWxlc1wiXG4gICAgICBhcHBlYXJcbiAgICA+XG4gICAgICA8ZGl2XG4gICAgICAgIHYtZm9yPVwiKF9tb2R1bGUsIGluZGV4KSBpbiBzZWN0aW9uX21vZHVsZXNfbGlzdFwiXG4gICAgICAgIDprZXk9XCJfbW9kdWxlLiRwYXRoXCJcbiAgICAgID5cbiAgICAgICAgPFN0b3Btb3Rpb25Nb2R1bGVcbiAgICAgICAgICA6aW5kZXg9XCJpbmRleFwiXG4gICAgICAgICAgOm1ha2Vtb2R1bGU9XCJfbW9kdWxlXCJcbiAgICAgICAgICA6bnVtYmVyX29mX21vZHVsZXM9XCJzZWN0aW9uX21vZHVsZXNfbGlzdC5sZW5ndGhcIlxuICAgICAgICAgIDppbXBvc2VkX3JhdGlvPVwiZmlyc3RfbWVkaWFfcmF0aW9cIlxuICAgICAgICAgIDptb2R1bGVfcG9zaXRpb249XCJcbiAgICAgICAgICAgIHNlY3Rpb25fbW9kdWxlc19saXN0Lmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgICA/ICdhbG9uZSdcbiAgICAgICAgICAgICAgOiBpbmRleCA9PT0gMFxuICAgICAgICAgICAgICA/ICdmaXJzdCdcbiAgICAgICAgICAgICAgOiBpbmRleCA9PT0gc2VjdGlvbl9tb2R1bGVzX2xpc3QubGVuZ3RoIC0gMVxuICAgICAgICAgICAgICA/ICdsYXN0J1xuICAgICAgICAgICAgICA6ICdpbmJldHdlZW4nXG4gICAgICAgICAgXCJcbiAgICAgICAgICBAbW92ZVRvPVwibW92ZU1vZHVsZVRvXCJcbiAgICAgICAgICBAbW92ZVVwPVwiXG4gICAgICAgICAgICBtb3ZlTW9kdWxlVG8oeyBwYXRoOiBfbW9kdWxlLiRwYXRoLCBuZXdfcG9zaXRpb246IGluZGV4IC0gMSB9KVxuICAgICAgICAgIFwiXG4gICAgICAgICAgQG1vdmVEb3duPVwiXG4gICAgICAgICAgICBtb3ZlTW9kdWxlVG8oeyBwYXRoOiBfbW9kdWxlLiRwYXRoLCBuZXdfcG9zaXRpb246IGluZGV4ICsgMSB9KVxuICAgICAgICAgIFwiXG4gICAgICAgICAgQHJlbW92ZT1cInJlbW92ZU1vZHVsZVwiXG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxNb2R1bGVDcmVhdG9yXG4gICAgICAgIGtleT1cIm1jXzBcIlxuICAgICAgICA6cHVibGljYXRpb25fcGF0aD1cIm1ha2UuJHBhdGhcIlxuICAgICAgICA6c3RhcnRfY29sbGFwc2VkPVwiZmFsc2VcIlxuICAgICAgICA6dHlwZXNfYXZhaWxhYmxlPVwiWydjYXB0dXJlJywgJ2ltcG9ydCddXCJcbiAgICAgICAgOnBpY2tfZnJvbV90eXBlcz1cIlsnaW1hZ2UnXVwiXG4gICAgICAgIDpjb250ZXh0PVwiJ21vbnRhZ2UnXCJcbiAgICAgICAgQGFkZE1vZHVsZXM9XCJhZGRNb2R1bGVzXCJcbiAgICAgIC8+XG4gICAgPC90cmFuc2l0aW9uLWdyb3VwPlxuXG4gICAgPHRyYW5zaXRpb24gbmFtZT1cInBhZ2VjaGFuZ2VcIiBtb2RlPVwib3V0LWluXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiX2JvdHRvbVJvd1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiX2VxdWF0aW9uSWNvblwiPlxuICAgICAgICAgIDxiLWljb24gaWNvbj1cImNoZXZyb24tZG91YmxlLWRvd25cIiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiX2NyZWF0ZVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIl9mcHNQaWNrXCI+XG4gICAgICAgICAgICAgIDxSYW5nZVZhbHVlSW5wdXRcbiAgICAgICAgICAgICAgICA6Y2FuX3RvZ2dsZT1cImZhbHNlXCJcbiAgICAgICAgICAgICAgICA6bGFiZWw9XCIkdCgnaW1nX3Blcl9zZWNvbmQnKVwiXG4gICAgICAgICAgICAgICAgOnZhbHVlPVwiZnJhbWVfcmF0ZVwiXG4gICAgICAgICAgICAgICAgOm1pbj1cIjJcIlxuICAgICAgICAgICAgICAgIDptYXg9XCIzMFwiXG4gICAgICAgICAgICAgICAgOnN0ZXA9XCIxXCJcbiAgICAgICAgICAgICAgICA6dGlja3M9XCJbMiwgNCwgOCwgMTUsIDI0LCAzMF1cIlxuICAgICAgICAgICAgICAgIDpkZWZhdWx0X3ZhbHVlPVwiNFwiXG4gICAgICAgICAgICAgICAgQHNhdmU9XCJ1cGRhdGVGcmFtZVJhdGVcIlxuICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgIDwhLS0gPGxhYmVsIGNsYXNzPVwidS1sYWJlbFwiPnt7ICR0KFwiaW1nX3Blcl9zZWNvbmRcIikgfX08L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCB2LW1vZGVsLm51bWJlcj1cImZyYW1lX3JhdGVcIiBzaXplPVwic21hbGxcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbj4yPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24+NDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPjg8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj4xNTwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPjI0PC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24+MzA8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImN1c3RvbVwiPnt7ICR0KFwiY3VzdG9tXCIpIH19PC9vcHRpb24+XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB2LW1vZGVsLm51bWJlcj1cImZyYW1lX3JhdGVcIlxuICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgbWluPVwiMVwiXG4gICAgICAgICAgICAgIG1heD1cIjYwXCJcbiAgICAgICAgICAgICAgc3RlcD1cIjFcIlxuICAgICAgICAgICAgICBsaXN0PVwiZnJhbWVfcmF0ZV9vcHRpb25zXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8ZGF0YWxpc3QgaWQ9XCJmcmFtZV9yYXRlX29wdGlvbnNcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2LWZvcj1cImkgaW4gNjBcIiA6dmFsdWU9XCJpXCIgOmtleT1cImlcIiAvPlxuICAgICAgICAgICAgPC9kYXRhbGlzdD4gLS0+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzPVwidS1idXR0b24gdS1idXR0b25fYmxldW1hcmluZVwiXG4gICAgICAgICAgICAgIDpkaXNhYmxlZD1cIiFleHBvcnRfaXNfYXZhaWxhYmxlXCJcbiAgICAgICAgICAgICAgQGNsaWNrPVwic2hvd19yZW5kZXJfbW9kYWwgPSB0cnVlXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGItaWNvbiBpY29uPVwiY2hlY2tcIiAvPlxuICAgICAgICAgICAgICB7eyAkdChcIm1ha2VcIikgfX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvdHJhbnNpdGlvbj5cblxuICAgIDxFeHBvcnRTYXZlTWFrZU1vZGFsMlxuICAgICAgdi1pZj1cInNob3dfcmVuZGVyX21vZGFsXCJcbiAgICAgIDpiYXNlX2luc3RydWN0aW9ucz1cImJhc2VfaW5zdHJ1Y3Rpb25zXCJcbiAgICAgIDptYWtlX3BhdGg9XCJtYWtlLiRwYXRoXCJcbiAgICAgIDpyZWZlcmVuY2VfbWVkaWE9XCJmaXJzdF9tZWRpYVwiXG4gICAgICA6cG9zc2libGVfZm9ybWF0cz1cInBvc3NpYmxlX2Zvcm1hdHNcIlxuICAgICAgOmRlZmF1bHRfcmVzb2x1dGlvbl9wcmVzZXQ9XCInaGlnaCdcIlxuICAgICAgQGNsb3NlPVwic2hvd19yZW5kZXJfbW9kYWwgPSBmYWxzZVwiXG4gICAgLz5cbiAgPC9kaXY+XG48L3RlbXBsYXRlPlxuPHNjcmlwdD5cbmltcG9ydCBNb2R1bGVDcmVhdG9yIGZyb20gXCJAL2NvbXBvbmVudHMvcHVibGljYXRpb25zL21vZHVsZXMvTW9kdWxlQ3JlYXRvci52dWVcIjtcbmltcG9ydCBTdG9wbW90aW9uTW9kdWxlIGZyb20gXCJAL2NvbXBvbmVudHMvbWFrZXMvU3RvcG1vdGlvbk1vZHVsZS52dWVcIjtcbmltcG9ydCBFeHBvcnRTYXZlTWFrZU1vZGFsMiBmcm9tIFwiQC9jb21wb25lbnRzL21ha2VzL0V4cG9ydFNhdmVNYWtlTW9kYWwyLnZ1ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHByb3BzOiB7XG4gICAgbWFrZTogT2JqZWN0LFxuICB9LFxuICBjb21wb25lbnRzOiB7XG4gICAgTW9kdWxlQ3JlYXRvcixcbiAgICBTdG9wbW90aW9uTW9kdWxlLFxuICAgIEV4cG9ydFNhdmVNYWtlTW9kYWwyLFxuICB9LFxuICBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzaG93X3JlbmRlcl9tb2RhbDogZmFsc2UsXG4gICAgICBpc19leHBvcnRpbmc6IGZhbHNlLFxuICAgICAgY3JlYXRlZF92aWRlbzogZmFsc2UsXG4gICAgICBleHBvcnRfaHJlZjogdW5kZWZpbmVkLFxuICAgICAgZnJhbWVfcmF0ZTogdGhpcy5tYWtlLmZyYW1lX3JhdGUgfHwgNCxcblxuICAgICAgY3VzdG9tX3Jlc29sdXRpb25fd2lkdGg6IDE5MjAsXG4gICAgICBjdXN0b21fcmVzb2x1dGlvbl9oZWlnaHQ6IDEwODAsXG5cbiAgICAgIHJlc29sdXRpb25fcHJlc2V0X3BpY2tlZDogXCJvcmlnaW5hbFwiLFxuICAgIH07XG4gIH0sXG4gIGFzeW5jIGNyZWF0ZWQoKSB7XG4gICAgaWYgKCF0aGlzLnNlY3Rpb25zIHx8IHRoaXMuc2VjdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICBhd2FpdCB0aGlzLmNyZWF0ZVNlY3Rpb24yKHtcbiAgICAgICAgcHVibGljYXRpb246IHRoaXMubWFrZSxcbiAgICAgICAgdHlwZTogXCJzZWN0aW9uXCIsXG4gICAgICAgIGdyb3VwOiBcInNlY3Rpb25zX2xpc3RcIixcbiAgICAgICAgdGl0bGU6IFwic3RvcG1vdGlvblwiLFxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBtb3VudGVkKCkge30sXG4gIGJlZm9yZURlc3Ryb3koKSB7fSxcbiAgd2F0Y2g6IHtcbiAgICBmaXJzdF9tZWRpYToge1xuICAgICAgaGFuZGxlcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmZpcnN0X21lZGlhPy4kaW5mb3MpIHJldHVybjtcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLmZpcnN0X21lZGlhLiRpbmZvcztcbiAgICAgICAgaWYgKHdpZHRoICYmIGhlaWdodCkge1xuICAgICAgICAgIHRoaXMuY3VzdG9tX3Jlc29sdXRpb25fd2lkdGggPSB3aWR0aDtcbiAgICAgICAgICB0aGlzLmN1c3RvbV9yZXNvbHV0aW9uX2hlaWdodCA9IGhlaWdodDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICB9LFxuICAgIFwibWFrZS5mcmFtZV9yYXRlXCI6IHtcbiAgICAgIGhhbmRsZXIoKSB7XG4gICAgICAgIHRoaXMuZnJhbWVfcmF0ZSA9IHRoaXMubWFrZS5mcmFtZV9yYXRlO1xuICAgICAgfSxcbiAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICB9LFxuICB9LFxuICBjb21wdXRlZDoge1xuICAgIHBvc3NpYmxlX2Zvcm1hdHMoKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAga2V5OiBcIm1wNFwiLFxuICAgICAgICAgIHRleHQ6IHRoaXMuJHQoXCJ2aWRlb19tcDRcIiksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBrZXk6IFwiZ2lmXCIsXG4gICAgICAgICAgdGV4dDogdGhpcy4kdChcInZpZGVvX2dpZlwiKSxcbiAgICAgICAgfSxcbiAgICAgIF07XG4gICAgfSxcbiAgICBleHBvcnRfaXNfYXZhaWxhYmxlKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbl9tb2R1bGVzX2xpc3QubGVuZ3RoID4gMDtcbiAgICB9LFxuICAgIHNlY3Rpb25zKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0U2VjdGlvbnNXaXRoUHJvcHMoe1xuICAgICAgICBwdWJsaWNhdGlvbjogdGhpcy5tYWtlLFxuICAgICAgICBncm91cDogXCJzZWN0aW9uc19saXN0XCIsXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGZpcnN0X3NlY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZWN0aW9ucy5hdCgwKTtcbiAgICB9LFxuICAgIGZpcnN0X21lZGlhKCkge1xuICAgICAgaWYgKHRoaXMuc2VjdGlvbl9tb2R1bGVzX2xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBmaXJzdF9tb2R1bGUgPSB0aGlzLnNlY3Rpb25fbW9kdWxlc19saXN0LmF0KDApO1xuICAgICAgICByZXR1cm4gdGhpcy5maXJzdE1lZGlhKGZpcnN0X21vZHVsZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0sXG4gICAgc2VjdGlvbl9tb2R1bGVzX2xpc3QoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRNb2R1bGVzRm9yU2VjdGlvbih7XG4gICAgICAgIHB1YmxpY2F0aW9uOiB0aGlzLm1ha2UsXG4gICAgICAgIHNlY3Rpb246IHRoaXMuZmlyc3Rfc2VjdGlvbixcbiAgICAgIH0pLm1hcCgoeyBfbW9kdWxlIH0pID0+IF9tb2R1bGUpO1xuICAgIH0sXG4gICAgZmlyc3RfbWVkaWFfcmF0aW8oKSB7XG4gICAgICByZXR1cm4gdGhpcy5maXJzdF9tZWRpYT8uJGluZm9zPy5yYXRpbyB8fCB1bmRlZmluZWQ7XG4gICAgfSxcbiAgICBiYXNlX2luc3RydWN0aW9ucygpIHtcbiAgICAgIGNvbnN0IHJlY2lwZSA9IFwic3RvcG1vdGlvbl9hbmltYXRpb25cIjtcblxuICAgICAgY29uc3QgaW1hZ2VzX21ldGEgPSB0aGlzLnNlY3Rpb25fbW9kdWxlc19saXN0LnJlZHVjZSgoYWNjLCBtKSA9PiB7XG4gICAgICAgIGNvbnN0IG1ldGFfZmlsZW5hbWVfaW5fcHJvamVjdCA9XG4gICAgICAgICAgbS5zb3VyY2VfbWVkaWFzWzBdPy5tZXRhX2ZpbGVuYW1lX2luX3Byb2plY3Q7XG4gICAgICAgIGlmIChtZXRhX2ZpbGVuYW1lX2luX3Byb2plY3QpIHtcbiAgICAgICAgICBhY2MucHVzaCh7XG4gICAgICAgICAgICBtOiBtZXRhX2ZpbGVuYW1lX2luX3Byb2plY3QsXG4gICAgICAgICAgICBkOiAxLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9LCBbXSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlY2lwZSxcbiAgICAgICAgaW1hZ2VzX21ldGEsXG4gICAgICAgIGZyYW1lX3JhdGU6IHRoaXMuZnJhbWVfcmF0ZSxcbiAgICAgIH07XG4gICAgfSxcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIGFzeW5jIGFkZE1vZHVsZXMoeyBtZXRhX2ZpbGVuYW1lcyB9KSB7XG4gICAgICBhd2FpdCB0aGlzLmluc2VydE1vZHVsZU1ldGFGaWxlbmFtZXNUb0xpc3QyKHtcbiAgICAgICAgcHVibGljYXRpb246IHRoaXMubWFrZSxcbiAgICAgICAgc2VjdGlvbjogdGhpcy5maXJzdF9zZWN0aW9uLFxuICAgICAgICBtZXRhX2ZpbGVuYW1lcyxcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgYXN5bmMgaW5zZXJ0TW9kdWxlcyh7IG1ldGFfZmlsZW5hbWVzLCBpbmRleCB9KSB7XG4gICAgICBhd2FpdCB0aGlzLmluc2VydE1vZHVsZU1ldGFGaWxlbmFtZXNUb0xpc3QyKHtcbiAgICAgICAgcHVibGljYXRpb246IHRoaXMubWFrZSxcbiAgICAgICAgc2VjdGlvbjogdGhpcy5maXJzdF9zZWN0aW9uLFxuICAgICAgICBpbmRleCxcbiAgICAgICAgbWV0YV9maWxlbmFtZXMsXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGFzeW5jIG1vdmVNb2R1bGVUbyh7IHBhdGgsIG5ld19wb3NpdGlvbiB9KSB7XG4gICAgICBhd2FpdCB0aGlzLm1vdmVNb2R1bGVUbzIoe1xuICAgICAgICBwdWJsaWNhdGlvbjogdGhpcy5tYWtlLFxuICAgICAgICBzZWN0aW9uOiB0aGlzLmZpcnN0X3NlY3Rpb24sXG4gICAgICAgIG1ldGFfZmlsZW5hbWU6IHRoaXMuZ2V0RmlsZW5hbWUocGF0aCksXG4gICAgICAgIG5ld19wb3NpdGlvbixcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgYXN5bmMgcmVtb3ZlTW9kdWxlKHBhdGgpIHtcbiAgICAgIGF3YWl0IHRoaXMucmVtb3ZlTW9kdWxlMih7XG4gICAgICAgIHB1YmxpY2F0aW9uOiB0aGlzLm1ha2UsXG4gICAgICAgIHNlY3Rpb246IHRoaXMuZmlyc3Rfc2VjdGlvbixcbiAgICAgICAgcGF0aCxcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgdXBkYXRlRnJhbWVSYXRlKGZyYW1lX3JhdGUpIHtcbiAgICAgIHRoaXMuJGFwaS51cGRhdGVNZXRhKHtcbiAgICAgICAgcGF0aDogdGhpcy5tYWtlLiRwYXRoLFxuICAgICAgICBuZXdfbWV0YTogeyBmcmFtZV9yYXRlIH0sXG4gICAgICB9KTtcbiAgICB9LFxuICB9LFxufTtcbjwvc2NyaXB0PlxuPHN0eWxlIGxhbmc9XCJzY3NzXCIgc2NvcGVkPlxuLl9saXN0T2ZNb2R1bGVzIHtcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMjAwcHgsIDFmcikpO1xuICBnYXA6IHZhcigtLXNwYWNpbmcpO1xuICBtYXJnaW46IHZhcigtLXNwYWNpbmcpIDA7XG59XG5cbi5fZXF1YXRpb25JY29uIHtcbiAgZm9udC1zaXplOiAyZW07XG4gIGxpbmUtaGVpZ2h0OiAxO1xuICBtYXJnaW46IGNhbGModmFyKC0tc3BhY2luZykgKiAyKTtcbiAgY29sb3I6IHdoaXRlO1xufVxuXG4uX2JvdHRvbVJvdyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZmxvdzogY29sdW1uIG5vd3JhcDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIG1hcmdpbi10b3A6IGNhbGModmFyKC0tc3BhY2luZykgKiAyKTtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuXG4uX2NyZWF0ZSB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZmxvdzogY29sdW1uIG5vd3JhcDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGdhcDogdmFyKC0tc3BhY2luZyk7XG4gIGJhY2tncm91bmQ6IHdoaXRlO1xuICBwYWRkaW5nOiBjYWxjKHZhcigtLXNwYWNpbmcpIC8gMikgY2FsYyh2YXIoLS1zcGFjaW5nKSAvIDEpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1pbnB1dC1ib3JkZXItcmFkaXVzKTtcblxuICBsYWJlbCB7XG4gICAgY29sb3I6IGluaGVyaXQ7XG4gIH1cbn1cblxuLl9mcHNQaWNrIHtcbn1cbjwvc3R5bGU+XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/makes/MakeStopmotionAnimation.vue?vue&type=script&lang=js\n");

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[0]!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??ruleSet[1].rules[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/makes/MakeStopmotionAnimation.vue?vue&type=template&id=91385cd8&scoped=true":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[0]!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??ruleSet[1].rules[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/makes/MakeStopmotionAnimation.vue?vue&type=template&id=91385cd8&scoped=true ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   render: function() { return /* binding */ render; },\n/* harmony export */   staticRenderFns: function() { return /* binding */ staticRenderFns; }\n/* harmony export */ });\nvar render = function render() {\n  var _vm = this,\n    _c = _vm._self._c;\n  return _c(\"div\", [_c(\"transition-group\", {\n    staticClass: \"_listOfModules\",\n    attrs: {\n      tag: \"div\",\n      name: \"StoryModules\",\n      appear: \"\"\n    }\n  }, [_vm._l(_vm.section_modules_list, function (_module, index) {\n    return _c(\"div\", {\n      key: _module.$path\n    }, [_c(\"StopmotionModule\", {\n      attrs: {\n        index: index,\n        makemodule: _module,\n        number_of_modules: _vm.section_modules_list.length,\n        imposed_ratio: _vm.first_media_ratio,\n        module_position: _vm.section_modules_list.length === 1 ? \"alone\" : index === 0 ? \"first\" : index === _vm.section_modules_list.length - 1 ? \"last\" : \"inbetween\"\n      },\n      on: {\n        moveTo: _vm.moveModuleTo,\n        moveUp: function ($event) {\n          return _vm.moveModuleTo({\n            path: _module.$path,\n            new_position: index - 1\n          });\n        },\n        moveDown: function ($event) {\n          return _vm.moveModuleTo({\n            path: _module.$path,\n            new_position: index + 1\n          });\n        },\n        remove: _vm.removeModule\n      }\n    })], 1);\n  }), _c(\"ModuleCreator\", {\n    key: \"mc_0\",\n    attrs: {\n      publication_path: _vm.make.$path,\n      start_collapsed: false,\n      types_available: [\"capture\", \"import\"],\n      pick_from_types: [\"image\"],\n      context: \"montage\"\n    },\n    on: {\n      addModules: _vm.addModules\n    }\n  })], 2), _c(\"transition\", {\n    attrs: {\n      name: \"pagechange\",\n      mode: \"out-in\"\n    }\n  }, [_c(\"div\", {\n    staticClass: \"_bottomRow\"\n  }, [_c(\"div\", {\n    staticClass: \"_equationIcon\"\n  }, [_c(\"b-icon\", {\n    attrs: {\n      icon: \"chevron-double-down\"\n    }\n  })], 1), _c(\"div\", [_c(\"div\", {\n    staticClass: \"_create\"\n  }, [_c(\"div\", {\n    staticClass: \"_fpsPick\"\n  }, [_c(\"RangeValueInput\", {\n    attrs: {\n      can_toggle: false,\n      label: _vm.$t(\"img_per_second\"),\n      value: _vm.frame_rate,\n      min: 2,\n      max: 30,\n      step: 1,\n      ticks: [2, 4, 8, 15, 24, 30],\n      default_value: 4\n    },\n    on: {\n      save: _vm.updateFrameRate\n    }\n  })], 1), _c(\"button\", {\n    staticClass: \"u-button u-button_bleumarine\",\n    attrs: {\n      type: \"button\",\n      disabled: !_vm.export_is_available\n    },\n    on: {\n      click: function ($event) {\n        _vm.show_render_modal = true;\n      }\n    }\n  }, [_c(\"b-icon\", {\n    attrs: {\n      icon: \"check\"\n    }\n  }), _vm._v(\" \" + _vm._s(_vm.$t(\"make\")) + \" \")], 1)])])])]), _vm.show_render_modal ? _c(\"ExportSaveMakeModal2\", {\n    attrs: {\n      base_instructions: _vm.base_instructions,\n      make_path: _vm.make.$path,\n      reference_media: _vm.first_media,\n      possible_formats: _vm.possible_formats,\n      default_resolution_preset: \"high\"\n    },\n    on: {\n      close: function ($event) {\n        _vm.show_render_modal = false;\n      }\n    }\n  }) : _vm._e()], 1);\n};\nvar staticRenderFns = [];\nrender._withStripped = true;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvYmFiZWwtbG9hZGVyL2xpYi9pbmRleC5qcz8/Y2xvbmVkUnVsZVNldC00MC51c2VbMF0hLi9ub2RlX21vZHVsZXMvQHZ1ZS92dWUtbG9hZGVyLXYxNS9saWIvbG9hZGVycy90ZW1wbGF0ZUxvYWRlci5qcz8/cnVsZVNldFsxXS5ydWxlc1szXSEuL25vZGVfbW9kdWxlcy9AdnVlL3Z1ZS1sb2FkZXItdjE1L2xpYi9pbmRleC5qcz8/dnVlLWxvYWRlci1vcHRpb25zIS4vc3JjL2NvbXBvbmVudHMvbWFrZXMvTWFrZVN0b3Btb3Rpb25BbmltYXRpb24udnVlP3Z1ZSZ0eXBlPXRlbXBsYXRlJmlkPTkxMzg1Y2Q4JnNjb3BlZD10cnVlIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFNQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUdBO0FBRUE7QUFBQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBSUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQUE7QUFHQTtBQUFBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFJQTtBQUFBO0FBR0E7QUFBQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFPQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFBQTtBQUFBO0FBQUE7QUFXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUtBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2FwcC8uL3NyYy9jb21wb25lbnRzL21ha2VzL01ha2VTdG9wbW90aW9uQW5pbWF0aW9uLnZ1ZT9kZTg1Il0sInNvdXJjZXNDb250ZW50IjpbInZhciByZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gIHZhciBfdm0gPSB0aGlzLFxuICAgIF9jID0gX3ZtLl9zZWxmLl9jXG4gIHJldHVybiBfYyhcbiAgICBcImRpdlwiLFxuICAgIFtcbiAgICAgIF9jKFxuICAgICAgICBcInRyYW5zaXRpb24tZ3JvdXBcIixcbiAgICAgICAge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiBcIl9saXN0T2ZNb2R1bGVzXCIsXG4gICAgICAgICAgYXR0cnM6IHsgdGFnOiBcImRpdlwiLCBuYW1lOiBcIlN0b3J5TW9kdWxlc1wiLCBhcHBlYXI6IFwiXCIgfSxcbiAgICAgICAgfSxcbiAgICAgICAgW1xuICAgICAgICAgIF92bS5fbChfdm0uc2VjdGlvbl9tb2R1bGVzX2xpc3QsIGZ1bmN0aW9uIChfbW9kdWxlLCBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIF9jKFxuICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICB7IGtleTogX21vZHVsZS4kcGF0aCB9LFxuICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgX2MoXCJTdG9wbW90aW9uTW9kdWxlXCIsIHtcbiAgICAgICAgICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgbWFrZW1vZHVsZTogX21vZHVsZSxcbiAgICAgICAgICAgICAgICAgICAgbnVtYmVyX29mX21vZHVsZXM6IF92bS5zZWN0aW9uX21vZHVsZXNfbGlzdC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGltcG9zZWRfcmF0aW86IF92bS5maXJzdF9tZWRpYV9yYXRpbyxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlX3Bvc2l0aW9uOlxuICAgICAgICAgICAgICAgICAgICAgIF92bS5zZWN0aW9uX21vZHVsZXNfbGlzdC5sZW5ndGggPT09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJhbG9uZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGluZGV4ID09PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFwiZmlyc3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBpbmRleCA9PT0gX3ZtLnNlY3Rpb25fbW9kdWxlc19saXN0Lmxlbmd0aCAtIDFcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJsYXN0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJpbmJldHdlZW5cIixcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICAgICAgICBtb3ZlVG86IF92bS5tb3ZlTW9kdWxlVG8sXG4gICAgICAgICAgICAgICAgICAgIG1vdmVVcDogZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdm0ubW92ZU1vZHVsZVRvKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IF9tb2R1bGUuJHBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdfcG9zaXRpb246IGluZGV4IC0gMSxcbiAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBtb3ZlRG93bjogZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdm0ubW92ZU1vZHVsZVRvKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IF9tb2R1bGUuJHBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdfcG9zaXRpb246IGluZGV4ICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZW1vdmU6IF92bS5yZW1vdmVNb2R1bGUsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAxXG4gICAgICAgICAgICApXG4gICAgICAgICAgfSksXG4gICAgICAgICAgX2MoXCJNb2R1bGVDcmVhdG9yXCIsIHtcbiAgICAgICAgICAgIGtleTogXCJtY18wXCIsXG4gICAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgICBwdWJsaWNhdGlvbl9wYXRoOiBfdm0ubWFrZS4kcGF0aCxcbiAgICAgICAgICAgICAgc3RhcnRfY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgdHlwZXNfYXZhaWxhYmxlOiBbXCJjYXB0dXJlXCIsIFwiaW1wb3J0XCJdLFxuICAgICAgICAgICAgICBwaWNrX2Zyb21fdHlwZXM6IFtcImltYWdlXCJdLFxuICAgICAgICAgICAgICBjb250ZXh0OiBcIm1vbnRhZ2VcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbjogeyBhZGRNb2R1bGVzOiBfdm0uYWRkTW9kdWxlcyB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICAyXG4gICAgICApLFxuICAgICAgX2MoXCJ0cmFuc2l0aW9uXCIsIHsgYXR0cnM6IHsgbmFtZTogXCJwYWdlY2hhbmdlXCIsIG1vZGU6IFwib3V0LWluXCIgfSB9LCBbXG4gICAgICAgIF9jKFwiZGl2XCIsIHsgc3RhdGljQ2xhc3M6IFwiX2JvdHRvbVJvd1wiIH0sIFtcbiAgICAgICAgICBfYyhcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IHN0YXRpY0NsYXNzOiBcIl9lcXVhdGlvbkljb25cIiB9LFxuICAgICAgICAgICAgW19jKFwiYi1pY29uXCIsIHsgYXR0cnM6IHsgaWNvbjogXCJjaGV2cm9uLWRvdWJsZS1kb3duXCIgfSB9KV0sXG4gICAgICAgICAgICAxXG4gICAgICAgICAgKSxcbiAgICAgICAgICBfYyhcImRpdlwiLCBbXG4gICAgICAgICAgICBfYyhcImRpdlwiLCB7IHN0YXRpY0NsYXNzOiBcIl9jcmVhdGVcIiB9LCBbXG4gICAgICAgICAgICAgIF9jKFxuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgeyBzdGF0aWNDbGFzczogXCJfZnBzUGlja1wiIH0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgX2MoXCJSYW5nZVZhbHVlSW5wdXRcIiwge1xuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgICAgICAgICAgIGNhbl90b2dnbGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBfdm0uJHQoXCJpbWdfcGVyX3NlY29uZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogX3ZtLmZyYW1lX3JhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgbWluOiAyLFxuICAgICAgICAgICAgICAgICAgICAgIG1heDogMzAsXG4gICAgICAgICAgICAgICAgICAgICAgc3RlcDogMSxcbiAgICAgICAgICAgICAgICAgICAgICB0aWNrczogWzIsIDQsIDgsIDE1LCAyNCwgMzBdLFxuICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRfdmFsdWU6IDQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7IHNhdmU6IF92bS51cGRhdGVGcmFtZVJhdGUgfSxcbiAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICBfYyhcbiAgICAgICAgICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcInUtYnV0dG9uIHUtYnV0dG9uX2JsZXVtYXJpbmVcIixcbiAgICAgICAgICAgICAgICAgIGF0dHJzOiB7IHR5cGU6IFwiYnV0dG9uXCIsIGRpc2FibGVkOiAhX3ZtLmV4cG9ydF9pc19hdmFpbGFibGUgfSxcbiAgICAgICAgICAgICAgICAgIG9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgX3ZtLnNob3dfcmVuZGVyX21vZGFsID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgIF9jKFwiYi1pY29uXCIsIHsgYXR0cnM6IHsgaWNvbjogXCJjaGVja1wiIH0gfSksXG4gICAgICAgICAgICAgICAgICBfdm0uX3YoXCIgXCIgKyBfdm0uX3MoX3ZtLiR0KFwibWFrZVwiKSkgKyBcIiBcIiksXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSksXG4gICAgICBdKSxcbiAgICAgIF92bS5zaG93X3JlbmRlcl9tb2RhbFxuICAgICAgICA/IF9jKFwiRXhwb3J0U2F2ZU1ha2VNb2RhbDJcIiwge1xuICAgICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgICAgYmFzZV9pbnN0cnVjdGlvbnM6IF92bS5iYXNlX2luc3RydWN0aW9ucyxcbiAgICAgICAgICAgICAgbWFrZV9wYXRoOiBfdm0ubWFrZS4kcGF0aCxcbiAgICAgICAgICAgICAgcmVmZXJlbmNlX21lZGlhOiBfdm0uZmlyc3RfbWVkaWEsXG4gICAgICAgICAgICAgIHBvc3NpYmxlX2Zvcm1hdHM6IF92bS5wb3NzaWJsZV9mb3JtYXRzLFxuICAgICAgICAgICAgICBkZWZhdWx0X3Jlc29sdXRpb25fcHJlc2V0OiBcImhpZ2hcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgICAgIF92bS5zaG93X3JlbmRlcl9tb2RhbCA9IGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pXG4gICAgICAgIDogX3ZtLl9lKCksXG4gICAgXSxcbiAgICAxXG4gIClcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG5cbmV4cG9ydCB7IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zIH0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[0]!./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??ruleSet[1].rules[3]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/components/makes/MakeStopmotionAnimation.vue?vue&type=template&id=91385cd8&scoped=true\n");

/***/ })

});