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

/***/ "./src/router/index.js":
/*!*****************************!*\
  !*** ./src/router/index.js ***!
  \*****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ \"./node_modules/vue/dist/vue.esm.js\");\n/* harmony import */ var vue_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue-router */ \"./node_modules/vue-router/dist/vue-router.esm.js\");\n\n\nvue__WEBPACK_IMPORTED_MODULE_0__[\"default\"].use(vue_router__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\nconst routes = [{\n  path: \"/\",\n  name: \"Accueil\",\n  component: () => Promise.resolve().then(function webpackMissingModule() { var e = new Error(\"Cannot find module '../views/HomeView.vue'\"); e.code = 'MODULE_NOT_FOUND'; throw e; })\n}, {\n  path: \"/+:space_slug\",\n  name: \"Espace\",\n  component: () => Promise.resolve().then(function webpackMissingModule() { var e = new Error(\"Cannot find module '../views/SpaceView.vue'\"); e.code = 'MODULE_NOT_FOUND'; throw e; })\n}, {\n  path: \"/+:space_slug/:project_slug\",\n  name: \"Projet\",\n  component: () => Promise.resolve().then(function webpackMissingModule() { var e = new Error(\"Cannot find module '../views/ProjectView.vue'\"); e.code = 'MODULE_NOT_FOUND'; throw e; })\n}, {\n  path: \"/+:space_slug/:project_slug/publications/:publication_slug\",\n  name: \"Publication\",\n  component: () => Promise.resolve().then(function webpackMissingModule() { var e = new Error(\"Cannot find module '../views/PublicationView.vue'\"); e.code = 'MODULE_NOT_FOUND'; throw e; })\n}, {\n  path: \"/@:author_slug\",\n  name: \"Contributeur\",\n  component: () => Promise.resolve().then(function webpackMissingModule() { var e = new Error(\"Cannot find module '../views/AuthorView.vue'\"); e.code = 'MODULE_NOT_FOUND'; throw e; })\n}];\nconst router = new vue_router__WEBPACK_IMPORTED_MODULE_1__[\"default\"]({\n  mode: \"history\",\n  base: \"/\",\n  routes\n});\n/* harmony default export */ __webpack_exports__[\"default\"] = (router);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcm91dGVyL2luZGV4LmpzLmpzIiwibWFwcGluZ3MiOiI7OztBQUFBO0FBQ0E7QUFFQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBSUE7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovL2FwcC8uL3NyYy9yb3V0ZXIvaW5kZXguanM/NWFhNCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVnVlIGZyb20gXCJ2dWVcIjtcbmltcG9ydCBWdWVSb3V0ZXIgZnJvbSBcInZ1ZS1yb3V0ZXJcIjtcblxuVnVlLnVzZShWdWVSb3V0ZXIpO1xuXG5jb25zdCByb3V0ZXMgPSBbXG4gIHtcbiAgICBwYXRoOiBcIi9cIixcbiAgICBuYW1lOiBcIkFjY3VlaWxcIixcbiAgICBjb21wb25lbnQ6ICgpID0+XG4gICAgICBpbXBvcnQoLyogd2VicGFja0NodW5rTmFtZTogXCJIb21lVmlld1wiICovIFwiLi4vdmlld3MvSG9tZVZpZXcudnVlXCIpLFxuICB9LFxuICB7XG4gICAgcGF0aDogXCIvKzpzcGFjZV9zbHVnXCIsXG4gICAgbmFtZTogXCJFc3BhY2VcIixcbiAgICBjb21wb25lbnQ6ICgpID0+XG4gICAgICBpbXBvcnQoLyogd2VicGFja0NodW5rTmFtZTogXCJTcGFjZVZpZXdcIiAqLyBcIi4uL3ZpZXdzL1NwYWNlVmlldy52dWVcIiksXG4gIH0sXG4gIHtcbiAgICBwYXRoOiBcIi8rOnNwYWNlX3NsdWcvOnByb2plY3Rfc2x1Z1wiLFxuICAgIG5hbWU6IFwiUHJvamV0XCIsXG4gICAgY29tcG9uZW50OiAoKSA9PlxuICAgICAgaW1wb3J0KC8qIHdlYnBhY2tDaHVua05hbWU6IFwiUHJvamVjdFZpZXdcIiAqLyBcIi4uL3ZpZXdzL1Byb2plY3RWaWV3LnZ1ZVwiKSxcbiAgfSxcbiAge1xuICAgIHBhdGg6IFwiLys6c3BhY2Vfc2x1Zy86cHJvamVjdF9zbHVnL3B1YmxpY2F0aW9ucy86cHVibGljYXRpb25fc2x1Z1wiLFxuICAgIG5hbWU6IFwiUHVibGljYXRpb25cIixcbiAgICBjb21wb25lbnQ6ICgpID0+XG4gICAgICBpbXBvcnQoXG4gICAgICAgIC8qIHdlYnBhY2tDaHVua05hbWU6IFwiUHVibGljYXRpb25WaWV3XCIgKi8gXCIuLi92aWV3cy9QdWJsaWNhdGlvblZpZXcudnVlXCJcbiAgICAgICksXG4gIH0sXG4gIHtcbiAgICBwYXRoOiBcIi9AOmF1dGhvcl9zbHVnXCIsXG4gICAgbmFtZTogXCJDb250cmlidXRldXJcIixcbiAgICBjb21wb25lbnQ6ICgpID0+XG4gICAgICBpbXBvcnQoLyogd2VicGFja0NodW5rTmFtZTogXCJBdXRob3JWaWV3XCIgKi8gXCIuLi92aWV3cy9BdXRob3JWaWV3LnZ1ZVwiKSxcbiAgfSxcbl07XG5cbmNvbnN0IHJvdXRlciA9IG5ldyBWdWVSb3V0ZXIoe1xuICBtb2RlOiBcImhpc3RvcnlcIixcbiAgYmFzZTogXCIvXCIsXG4gIHJvdXRlcyxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/router/index.js\n");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ !function() {
/******/ 	__webpack_require__.h = function() { return "445f433d79ec4e5b"; }
/******/ }();
/******/ 
/******/ }
);