"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(typeof self !== 'undefined' ? self : this)["webpackHotUpdateapp"]("app",{

/***/ "./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/adc-core/inputs/TextInput.vue?vue&type=template&id=261a9a51&scoped=true&":
/*!***********************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/adc-core/inputs/TextInput.vue?vue&type=template&id=261a9a51&scoped=true& ***!
  \***********************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": function() { return /* binding */ render; },\n/* harmony export */   \"staticRenderFns\": function() { return /* binding */ staticRenderFns; }\n/* harmony export */ });\nvar render = function () {\n  var _vm = this\n  var _h = _vm.$createElement\n  var _c = _vm._self._c || _h\n  return _c(\n    \"div\",\n    [\n      _vm.label_str\n        ? _c(\"DLabel\", {\n            attrs: { str: _vm.$t(_vm.label_str), for_input: _vm.label_str },\n          })\n        : _vm._e(),\n      _vm.tag === \"input\"\n        ? [\n            _c(\"input\", {\n              ref: \"field\",\n              attrs: {\n                id: _vm.label_str,\n                type: _vm.field_input_type_prop,\n                name: _vm.label_str,\n                autocomplete: _vm.autocomplete,\n                size: _vm.size,\n                required: _vm.required,\n                placeholder: \"…\",\n              },\n              domProps: { value: _vm.content },\n              on: {\n                input: function ($event) {\n                  return _vm.$emit(\"update:content\", $event.target.value)\n                },\n                keydown: function ($event) {\n                  if (\n                    !$event.type.indexOf(\"key\") &&\n                    _vm._k($event.keyCode, \"enter\", 13, $event.key, \"Enter\")\n                  ) {\n                    return null\n                  }\n                  $event.preventDefault()\n                  return _vm.$emit(\"onEnter\")\n                },\n              },\n            }),\n          ]\n        : _vm.tag === \"span\"\n        ? _c(\"span\", {\n            ref: \"field\",\n            staticClass: \"u-input _content\",\n            attrs: { contenteditable: true, required: _vm.required },\n            on: {\n              input: function ($event) {\n                return _vm.$emit(\"update:content\", $event.target.innerText)\n              },\n            },\n          })\n        : _vm._e(),\n      _vm.minlength || _vm.maxlength || _vm.input_type === \"password\"\n        ? _c(\n            \"div\",\n            {\n              staticClass: \"_notices fieldCaption\",\n              class: {\n                \"u-colorRed\": !_vm.validity,\n              },\n            },\n            [\n              _c(\n                \"div\",\n                [\n                  _vm.minlength || _vm.maxlength\n                    ? [\n                        _vm.minlength\n                          ? [_vm._v(_vm._s(_vm.minlength) + \" ≤ \")]\n                          : _vm._e(),\n                        _vm._v(\" \" + _vm._s(_vm.content.length) + \" \"),\n                        _vm.maxlength\n                          ? [_vm._v(\" ≤ \" + _vm._s(_vm.maxlength))]\n                          : _vm._e(),\n                      ]\n                    : _vm._e(),\n                ],\n                2\n              ),\n              _vm.input_type === \"password\"\n                ? _c(\"div\", [\n                    _c(\n                      \"button\",\n                      {\n                        staticClass: \"u-buttonLink _revealBtn\",\n                        class: {\n                          \"is--active\": _vm.show_password_in_clear,\n                        },\n                        attrs: { type: \"button\" },\n                        on: { click: _vm.toggleInputType },\n                      },\n                      [_vm._v(\" \" + _vm._s(_vm.$t(\"reveal\")) + \" \")]\n                    ),\n                  ])\n                : _vm._e(),\n            ]\n          )\n        : _vm._e(),\n      _vm.input_type === \"markdown\"\n        ? _c(\"div\", [\n            _c(\"small\", {\n              staticClass: \"u-instructions\",\n              domProps: { innerHTML: _vm._s(_vm.$t(\"markdown_instr\")) },\n            }),\n          ])\n        : _vm._e(),\n      _vm.instructions\n        ? _c(\"div\", [\n            _c(\"small\", {\n              staticClass: \"u-instructions\",\n              domProps: { innerHTML: _vm._s(_vm.instructions) },\n            }),\n          ])\n        : _vm._e(),\n    ],\n    2\n  )\n}\nvar staticRenderFns = []\nrender._withStripped = true\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvQHZ1ZS92dWUtbG9hZGVyLXYxNS9saWIvbG9hZGVycy90ZW1wbGF0ZUxvYWRlci5qcz8/dnVlLWxvYWRlci1vcHRpb25zIS4vbm9kZV9tb2R1bGVzL0B2dWUvdnVlLWxvYWRlci12MTUvbGliL2luZGV4LmpzPz92dWUtbG9hZGVyLW9wdGlvbnMhLi9zcmMvYWRjLWNvcmUvaW5wdXRzL1RleHRJbnB1dC52dWU/dnVlJnR5cGU9dGVtcGxhdGUmaWQ9MjYxYTlhNTEmc2NvcGVkPXRydWUmLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hcHAvLi9zcmMvYWRjLWNvcmUvaW5wdXRzL1RleHRJbnB1dC52dWU/NzgxYyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgcmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgX3ZtID0gdGhpc1xuICB2YXIgX2ggPSBfdm0uJGNyZWF0ZUVsZW1lbnRcbiAgdmFyIF9jID0gX3ZtLl9zZWxmLl9jIHx8IF9oXG4gIHJldHVybiBfYyhcbiAgICBcImRpdlwiLFxuICAgIFtcbiAgICAgIF92bS5sYWJlbF9zdHJcbiAgICAgICAgPyBfYyhcIkRMYWJlbFwiLCB7XG4gICAgICAgICAgICBhdHRyczogeyBzdHI6IF92bS4kdChfdm0ubGFiZWxfc3RyKSwgZm9yX2lucHV0OiBfdm0ubGFiZWxfc3RyIH0sXG4gICAgICAgICAgfSlcbiAgICAgICAgOiBfdm0uX2UoKSxcbiAgICAgIF92bS50YWcgPT09IFwiaW5wdXRcIlxuICAgICAgICA/IFtcbiAgICAgICAgICAgIF9jKFwiaW5wdXRcIiwge1xuICAgICAgICAgICAgICByZWY6IFwiZmllbGRcIixcbiAgICAgICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgICAgICBpZDogX3ZtLmxhYmVsX3N0cixcbiAgICAgICAgICAgICAgICB0eXBlOiBfdm0uZmllbGRfaW5wdXRfdHlwZV9wcm9wLFxuICAgICAgICAgICAgICAgIG5hbWU6IF92bS5sYWJlbF9zdHIsXG4gICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlOiBfdm0uYXV0b2NvbXBsZXRlLFxuICAgICAgICAgICAgICAgIHNpemU6IF92bS5zaXplLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBfdm0ucmVxdWlyZWQsXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6IFwi4oCmXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGRvbVByb3BzOiB7IHZhbHVlOiBfdm0uY29udGVudCB9LFxuICAgICAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgICAgIGlucHV0OiBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gX3ZtLiRlbWl0KFwidXBkYXRlOmNvbnRlbnRcIiwgJGV2ZW50LnRhcmdldC52YWx1ZSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGtleWRvd246IGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgISRldmVudC50eXBlLmluZGV4T2YoXCJrZXlcIikgJiZcbiAgICAgICAgICAgICAgICAgICAgX3ZtLl9rKCRldmVudC5rZXlDb2RlLCBcImVudGVyXCIsIDEzLCAkZXZlbnQua2V5LCBcIkVudGVyXCIpXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgICByZXR1cm4gX3ZtLiRlbWl0KFwib25FbnRlclwiKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdXG4gICAgICAgIDogX3ZtLnRhZyA9PT0gXCJzcGFuXCJcbiAgICAgICAgPyBfYyhcInNwYW5cIiwge1xuICAgICAgICAgICAgcmVmOiBcImZpZWxkXCIsXG4gICAgICAgICAgICBzdGF0aWNDbGFzczogXCJ1LWlucHV0IF9jb250ZW50XCIsXG4gICAgICAgICAgICBhdHRyczogeyBjb250ZW50ZWRpdGFibGU6IHRydWUsIHJlcXVpcmVkOiBfdm0ucmVxdWlyZWQgfSxcbiAgICAgICAgICAgIG9uOiB7XG4gICAgICAgICAgICAgIGlucHV0OiBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF92bS4kZW1pdChcInVwZGF0ZTpjb250ZW50XCIsICRldmVudC50YXJnZXQuaW5uZXJUZXh0KVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KVxuICAgICAgICA6IF92bS5fZSgpLFxuICAgICAgX3ZtLm1pbmxlbmd0aCB8fCBfdm0ubWF4bGVuZ3RoIHx8IF92bS5pbnB1dF90eXBlID09PSBcInBhc3N3b3JkXCJcbiAgICAgICAgPyBfYyhcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcIl9ub3RpY2VzIGZpZWxkQ2FwdGlvblwiLFxuICAgICAgICAgICAgICBjbGFzczoge1xuICAgICAgICAgICAgICAgIFwidS1jb2xvclJlZFwiOiAhX3ZtLnZhbGlkaXR5LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgX2MoXG4gICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICBfdm0ubWlubGVuZ3RoIHx8IF92bS5tYXhsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBfdm0ubWlubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8gW192bS5fdihfdm0uX3MoX3ZtLm1pbmxlbmd0aCkgKyBcIiDiiaQgXCIpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IF92bS5fZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3ZtLl92KFwiIFwiICsgX3ZtLl9zKF92bS5jb250ZW50Lmxlbmd0aCkgKyBcIiBcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICBfdm0ubWF4bGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8gW192bS5fdihcIiDiiaQgXCIgKyBfdm0uX3MoX3ZtLm1heGxlbmd0aCkpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IF92bS5fZSgpLFxuICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgOiBfdm0uX2UoKSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgX3ZtLmlucHV0X3R5cGUgPT09IFwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgID8gX2MoXCJkaXZcIiwgW1xuICAgICAgICAgICAgICAgICAgICBfYyhcbiAgICAgICAgICAgICAgICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcInUtYnV0dG9uTGluayBfcmV2ZWFsQnRuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcImlzLS1hY3RpdmVcIjogX3ZtLnNob3dfcGFzc3dvcmRfaW5fY2xlYXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHsgdHlwZTogXCJidXR0b25cIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb246IHsgY2xpY2s6IF92bS50b2dnbGVJbnB1dFR5cGUgfSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIFtfdm0uX3YoXCIgXCIgKyBfdm0uX3MoX3ZtLiR0KFwicmV2ZWFsXCIpKSArIFwiIFwiKV1cbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgOiBfdm0uX2UoKSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICApXG4gICAgICAgIDogX3ZtLl9lKCksXG4gICAgICBfdm0uaW5wdXRfdHlwZSA9PT0gXCJtYXJrZG93blwiXG4gICAgICAgID8gX2MoXCJkaXZcIiwgW1xuICAgICAgICAgICAgX2MoXCJzbWFsbFwiLCB7XG4gICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiBcInUtaW5zdHJ1Y3Rpb25zXCIsXG4gICAgICAgICAgICAgIGRvbVByb3BzOiB7IGlubmVySFRNTDogX3ZtLl9zKF92bS4kdChcIm1hcmtkb3duX2luc3RyXCIpKSB9LFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgXSlcbiAgICAgICAgOiBfdm0uX2UoKSxcbiAgICAgIF92bS5pbnN0cnVjdGlvbnNcbiAgICAgICAgPyBfYyhcImRpdlwiLCBbXG4gICAgICAgICAgICBfYyhcInNtYWxsXCIsIHtcbiAgICAgICAgICAgICAgc3RhdGljQ2xhc3M6IFwidS1pbnN0cnVjdGlvbnNcIixcbiAgICAgICAgICAgICAgZG9tUHJvcHM6IHsgaW5uZXJIVE1MOiBfdm0uX3MoX3ZtLmluc3RydWN0aW9ucykgfSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF0pXG4gICAgICAgIDogX3ZtLl9lKCksXG4gICAgXSxcbiAgICAyXG4gIClcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG5cbmV4cG9ydCB7IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zIH0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/@vue/vue-loader-v15/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/adc-core/inputs/TextInput.vue?vue&type=template&id=261a9a51&scoped=true&\n");

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-37[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/adc-core/inputs/TextInput.vue?vue&type=script&lang=js&":
/*!**********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-37[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/adc-core/inputs/TextInput.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  props: {\n    label_str: {\n      type: String\n    },\n    input_type: {\n      type: String,\n      default: \"text\"\n    },\n    autocomplete: {\n      type: String\n    },\n    content: {\n      type: String,\n      default: \"\"\n    },\n    instructions: {\n      type: String\n    },\n    size: {\n      type: String\n    },\n    required: {\n      type: Boolean,\n      default: true\n    },\n    minlength: {\n      type: [Boolean, Number],\n      default: false\n    },\n    maxlength: {\n      type: [Boolean, Number],\n      default: false\n    }\n  },\n  components: {},\n  data() {\n    return {\n      show_password_in_clear: false\n    };\n  },\n  created() {},\n  mounted() {\n    this.initInput();\n  },\n  beforeDestroy() {},\n  watch: {\n    validity: {\n      handler() {\n        this.$emit(\"toggleValidity\", this.validity);\n      },\n      immediate: true\n    },\n    content() {}\n  },\n  computed: {\n    tag() {\n      if (this.input_type === \"markdown\") return \"span\";\n      return \"input\";\n    },\n    validity() {\n      if (this.required && this.content.length === 0) return false;\n      if (this.minlength && this.content.length < this.minlength) return false;\n      if (this.maxlength && this.content.length > this.maxlength) return false;\n      return true;\n    },\n    field_input_type_prop() {\n      if (this.input_type === \"password\") if (this.show_password_in_clear) return \"text\";else return \"password\";\n      return this.input_type;\n    }\n  },\n  methods: {\n    initInput() {\n      if (this.tag === \"span\") {\n        this.$refs.field.innerText = this.content;\n        this.focusSpanAtEnd();\n      } else if (this.tag === \"input\") {\n        this.$refs.field.focus();\n      }\n    },\n    focusSpanAtEnd() {\n      function placeCaretAtEnd(el) {\n        el.focus();\n        if (typeof window.getSelection != \"undefined\" && typeof document.createRange != \"undefined\") {\n          var range = document.createRange();\n          range.selectNodeContents(el);\n          range.collapse(false);\n          var sel = window.getSelection();\n          sel.removeAllRanges();\n          sel.addRange(range);\n        } else if (typeof document.body.createTextRange != \"undefined\") {\n          var textRange = document.body.createTextRange();\n          textRange.moveToElementText(el);\n          textRange.collapse(false);\n          textRange.select();\n        }\n      }\n      const field = this.$refs.field;\n      placeCaretAtEnd(field);\n    },\n    onPaste(e) {\n      // Get the copied text from the clipboard\n      const text = e.clipboardData ? (e.originalEvent || e).clipboardData.getData(\"text/plain\") :\n      // For IE\n      window.clipboardData ? window.clipboardData.getData(\"Text\") : \"\";\n      if (document.queryCommandSupported(\"insertText\")) {\n        document.execCommand(\"insertText\", false, text);\n      } else {\n        // Insert text at the current position of caret\n        const range = document.getSelection().getRangeAt(0);\n        range.deleteContents();\n        const textNode = document.createTextNode(text);\n        range.insertNode(textNode);\n        range.selectNodeContents(textNode);\n        range.collapse(false);\n        const selection = window.getSelection();\n        selection.removeAllRanges();\n        selection.addRange(range);\n      }\n    },\n    toggleInputType() {\n      this.show_password_in_clear = !this.show_password_in_clear;\n    }\n  }\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvYmFiZWwtbG9hZGVyL2xpYi9pbmRleC5qcz8/Y2xvbmVkUnVsZVNldC0zN1swXS5ydWxlc1swXS51c2VbMF0hLi9ub2RlX21vZHVsZXMvQHZ1ZS92dWUtbG9hZGVyLXYxNS9saWIvaW5kZXguanM/P3Z1ZS1sb2FkZXItb3B0aW9ucyEuL3NyYy9hZGMtY29yZS9pbnB1dHMvVGV4dElucHV0LnZ1ZT92dWUmdHlwZT1zY3JpcHQmbGFuZz1qcyYuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXBwL3NyYy9hZGMtY29yZS9pbnB1dHMvVGV4dElucHV0LnZ1ZT9jYmIzIl0sInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cbiAgPGRpdj5cbiAgICA8RExhYmVsIHYtaWY9XCJsYWJlbF9zdHJcIiA6c3RyPVwiJHQobGFiZWxfc3RyKVwiIDpmb3JfaW5wdXQ9XCJsYWJlbF9zdHJcIiAvPlxuICAgIDx0ZW1wbGF0ZSB2LWlmPVwidGFnID09PSAnaW5wdXQnXCI+XG4gICAgICA8aW5wdXRcbiAgICAgICAgcmVmPVwiZmllbGRcIlxuICAgICAgICA6aWQ9XCJsYWJlbF9zdHJcIlxuICAgICAgICA6dHlwZT1cImZpZWxkX2lucHV0X3R5cGVfcHJvcFwiXG4gICAgICAgIDpuYW1lPVwibGFiZWxfc3RyXCJcbiAgICAgICAgOmF1dG9jb21wbGV0ZT1cImF1dG9jb21wbGV0ZVwiXG4gICAgICAgIDpzaXplPVwic2l6ZVwiXG4gICAgICAgIDpyZXF1aXJlZD1cInJlcXVpcmVkXCJcbiAgICAgICAgOnBsYWNlaG9sZGVyPVwiJ+KApidcIlxuICAgICAgICA6dmFsdWU9XCJjb250ZW50XCJcbiAgICAgICAgQGlucHV0PVwiJGVtaXQoJ3VwZGF0ZTpjb250ZW50JywgJGV2ZW50LnRhcmdldC52YWx1ZSlcIlxuICAgICAgICBAa2V5ZG93bi5lbnRlci5wcmV2ZW50PVwiJGVtaXQoJ29uRW50ZXInKVwiXG4gICAgICAvPlxuICAgIDwvdGVtcGxhdGU+XG4gICAgPHNwYW5cbiAgICAgIHYtZWxzZS1pZj1cInRhZyA9PT0gJ3NwYW4nXCJcbiAgICAgIHJlZj1cImZpZWxkXCJcbiAgICAgIGNsYXNzPVwidS1pbnB1dCBfY29udGVudFwiXG4gICAgICA6Y29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXG4gICAgICA6cmVxdWlyZWQ9XCJyZXF1aXJlZFwiXG4gICAgICBAaW5wdXQ9XCIkZW1pdCgndXBkYXRlOmNvbnRlbnQnLCAkZXZlbnQudGFyZ2V0LmlubmVyVGV4dClcIlxuICAgIC8+XG4gICAgPCEtLSBAcGFzdGUucHJldmVudD1cIm9uUGFzdGVcIiAtLT5cbiAgICA8IS0tIEBrZXl1cC5lbnRlcj1cIiRlbWl0KCdvbkVudGVyJylcIiAtLT5cblxuICAgIDxkaXZcbiAgICAgIGNsYXNzPVwiX25vdGljZXMgZmllbGRDYXB0aW9uXCJcbiAgICAgIDpjbGFzcz1cIntcbiAgICAgICAgJ3UtY29sb3JSZWQnOiAhdmFsaWRpdHksXG4gICAgICB9XCJcbiAgICAgIHYtaWY9XCJtaW5sZW5ndGggfHwgbWF4bGVuZ3RoIHx8IGlucHV0X3R5cGUgPT09ICdwYXNzd29yZCdcIlxuICAgID5cbiAgICAgIDxkaXY+XG4gICAgICAgIDx0ZW1wbGF0ZSB2LWlmPVwibWlubGVuZ3RoIHx8IG1heGxlbmd0aFwiPlxuICAgICAgICAgIDx0ZW1wbGF0ZSB2LWlmPVwibWlubGVuZ3RoXCI+e3sgbWlubGVuZ3RoIH19IOKJpCA8L3RlbXBsYXRlPlxuICAgICAgICAgIHt7IGNvbnRlbnQubGVuZ3RoIH19XG4gICAgICAgICAgPHRlbXBsYXRlIHYtaWY9XCJtYXhsZW5ndGhcIj4g4omkIHt7IG1heGxlbmd0aCB9fTwvdGVtcGxhdGU+XG4gICAgICAgIDwvdGVtcGxhdGU+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgdi1pZj1cImlucHV0X3R5cGUgPT09ICdwYXNzd29yZCdcIj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzPVwidS1idXR0b25MaW5rIF9yZXZlYWxCdG5cIlxuICAgICAgICAgIDpjbGFzcz1cIntcbiAgICAgICAgICAgICdpcy0tYWN0aXZlJzogc2hvd19wYXNzd29yZF9pbl9jbGVhcixcbiAgICAgICAgICB9XCJcbiAgICAgICAgICBAY2xpY2s9XCJ0b2dnbGVJbnB1dFR5cGVcIlxuICAgICAgICA+XG4gICAgICAgICAge3sgJHQoXCJyZXZlYWxcIikgfX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cblxuICAgIDxkaXYgdi1pZj1cImlucHV0X3R5cGUgPT09ICdtYXJrZG93bidcIj5cbiAgICAgIDxzbWFsbCBjbGFzcz1cInUtaW5zdHJ1Y3Rpb25zXCIgdi1odG1sPVwiJHQoJ21hcmtkb3duX2luc3RyJylcIiAvPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgdi1pZj1cImluc3RydWN0aW9uc1wiPlxuICAgICAgPHNtYWxsIGNsYXNzPVwidS1pbnN0cnVjdGlvbnNcIiB2LWh0bWw9XCJpbnN0cnVjdGlvbnNcIiAvPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbjwvdGVtcGxhdGU+XG48c2NyaXB0PlxuZXhwb3J0IGRlZmF1bHQge1xuICBwcm9wczoge1xuICAgIGxhYmVsX3N0cjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgIH0sXG4gICAgaW5wdXRfdHlwZToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogXCJ0ZXh0XCIsXG4gICAgfSxcbiAgICBhdXRvY29tcGxldGU6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICB9LFxuICAgIGNvbnRlbnQ6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6IFwiXCIsXG4gICAgfSxcbiAgICBpbnN0cnVjdGlvbnM6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICB9LFxuICAgIHNpemU6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICB9LFxuICAgIHJlcXVpcmVkOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIG1pbmxlbmd0aDoge1xuICAgICAgdHlwZTogW0Jvb2xlYW4sIE51bWJlcl0sXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIG1heGxlbmd0aDoge1xuICAgICAgdHlwZTogW0Jvb2xlYW4sIE51bWJlcl0sXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICB9LFxuICBjb21wb25lbnRzOiB7fSxcbiAgZGF0YSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hvd19wYXNzd29yZF9pbl9jbGVhcjogZmFsc2UsXG4gICAgfTtcbiAgfSxcbiAgY3JlYXRlZCgpIHt9LFxuICBtb3VudGVkKCkge1xuICAgIHRoaXMuaW5pdElucHV0KCk7XG4gIH0sXG4gIGJlZm9yZURlc3Ryb3koKSB7fSxcbiAgd2F0Y2g6IHtcbiAgICB2YWxpZGl0eToge1xuICAgICAgaGFuZGxlcigpIHtcbiAgICAgICAgdGhpcy4kZW1pdChcInRvZ2dsZVZhbGlkaXR5XCIsIHRoaXMudmFsaWRpdHkpO1xuICAgICAgfSxcbiAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICB9LFxuICAgIGNvbnRlbnQoKSB7fSxcbiAgfSxcbiAgY29tcHV0ZWQ6IHtcbiAgICB0YWcoKSB7XG4gICAgICBpZiAodGhpcy5pbnB1dF90eXBlID09PSBcIm1hcmtkb3duXCIpIHJldHVybiBcInNwYW5cIjtcbiAgICAgIHJldHVybiBcImlucHV0XCI7XG4gICAgfSxcbiAgICB2YWxpZGl0eSgpIHtcbiAgICAgIGlmICh0aGlzLnJlcXVpcmVkICYmIHRoaXMuY29udGVudC5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICh0aGlzLm1pbmxlbmd0aCAmJiB0aGlzLmNvbnRlbnQubGVuZ3RoIDwgdGhpcy5taW5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICh0aGlzLm1heGxlbmd0aCAmJiB0aGlzLmNvbnRlbnQubGVuZ3RoID4gdGhpcy5tYXhsZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgZmllbGRfaW5wdXRfdHlwZV9wcm9wKCkge1xuICAgICAgaWYgKHRoaXMuaW5wdXRfdHlwZSA9PT0gXCJwYXNzd29yZFwiKVxuICAgICAgICBpZiAodGhpcy5zaG93X3Bhc3N3b3JkX2luX2NsZWFyKSByZXR1cm4gXCJ0ZXh0XCI7XG4gICAgICAgIGVsc2UgcmV0dXJuIFwicGFzc3dvcmRcIjtcbiAgICAgIHJldHVybiB0aGlzLmlucHV0X3R5cGU7XG4gICAgfSxcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIGluaXRJbnB1dCgpIHtcbiAgICAgIGlmICh0aGlzLnRhZyA9PT0gXCJzcGFuXCIpIHtcbiAgICAgICAgdGhpcy4kcmVmcy5maWVsZC5pbm5lclRleHQgPSB0aGlzLmNvbnRlbnQ7XG4gICAgICAgIHRoaXMuZm9jdXNTcGFuQXRFbmQoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50YWcgPT09IFwiaW5wdXRcIikge1xuICAgICAgICB0aGlzLiRyZWZzLmZpZWxkLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGZvY3VzU3BhbkF0RW5kKCkge1xuICAgICAgZnVuY3Rpb24gcGxhY2VDYXJldEF0RW5kKGVsKSB7XG4gICAgICAgIGVsLmZvY3VzKCk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0eXBlb2Ygd2luZG93LmdldFNlbGVjdGlvbiAhPSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAgICAgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZVJhbmdlICE9IFwidW5kZWZpbmVkXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWwpO1xuICAgICAgICAgIHJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcbiAgICAgICAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgdmFyIHRleHRSYW5nZSA9IGRvY3VtZW50LmJvZHkuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgdGV4dFJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGVsKTtcbiAgICAgICAgICB0ZXh0UmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xuICAgICAgICAgIHRleHRSYW5nZS5zZWxlY3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLiRyZWZzLmZpZWxkO1xuICAgICAgcGxhY2VDYXJldEF0RW5kKGZpZWxkKTtcbiAgICB9LFxuICAgIG9uUGFzdGUoZSkge1xuICAgICAgLy8gR2V0IHRoZSBjb3BpZWQgdGV4dCBmcm9tIHRoZSBjbGlwYm9hcmRcbiAgICAgIGNvbnN0IHRleHQgPSBlLmNsaXBib2FyZERhdGFcbiAgICAgICAgPyAoZS5vcmlnaW5hbEV2ZW50IHx8IGUpLmNsaXBib2FyZERhdGEuZ2V0RGF0YShcInRleHQvcGxhaW5cIilcbiAgICAgICAgOiAvLyBGb3IgSUVcbiAgICAgICAgd2luZG93LmNsaXBib2FyZERhdGFcbiAgICAgICAgPyB3aW5kb3cuY2xpcGJvYXJkRGF0YS5nZXREYXRhKFwiVGV4dFwiKVxuICAgICAgICA6IFwiXCI7XG5cbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeUNvbW1hbmRTdXBwb3J0ZWQoXCJpbnNlcnRUZXh0XCIpKSB7XG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiaW5zZXJ0VGV4dFwiLCBmYWxzZSwgdGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJbnNlcnQgdGV4dCBhdCB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiBjYXJldFxuICAgICAgICBjb25zdCByYW5nZSA9IGRvY3VtZW50LmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCk7XG4gICAgICAgIHJhbmdlLmRlbGV0ZUNvbnRlbnRzKCk7XG5cbiAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbiAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZSh0ZXh0Tm9kZSk7XG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyh0ZXh0Tm9kZSk7XG4gICAgICAgIHJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcblxuICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRvZ2dsZUlucHV0VHlwZSgpIHtcbiAgICAgIHRoaXMuc2hvd19wYXNzd29yZF9pbl9jbGVhciA9ICF0aGlzLnNob3dfcGFzc3dvcmRfaW5fY2xlYXI7XG4gICAgfSxcbiAgfSxcbn07XG48L3NjcmlwdD5cbjxzdHlsZSBsYW5nPVwic2Nzc1wiIHNjb3BlZD5cbi5fbm90aWNlcyB7XG4gIGZsZXg6IDAgMCBhdXRvO1xuICAvLyBwYWRkaW5nOiBjYWxjKHZhcigtLXNwYWNpbmcpIC8gNCk7XG4gIHBhZGRpbmc6IDA7XG5cbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuLl9yZXZlYWxCdG4ge1xuICBwYWRkaW5nOiAwO1xufVxuPC9zdHlsZT5cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./node_modules/babel-loader/lib/index.js??clonedRuleSet-37[0].rules[0].use[0]!./node_modules/@vue/vue-loader-v15/lib/index.js??vue-loader-options!./src/adc-core/inputs/TextInput.vue?vue&type=script&lang=js&\n");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ !function() {
/******/ 	__webpack_require__.h = function() { return "5e059baaad5e4e5d"; }
/******/ }();
/******/ 
/******/ }
);