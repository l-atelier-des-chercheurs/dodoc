import Vue from "vue";
import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

import i18n from "./adc-core/i18n.js";

import custom_socketio from "./adc-core/socketio.js";
Vue.prototype.$socketio = custom_socketio();

// import "@shoelace-style/shoelace/dist/themes/light.css";
// import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
// setBasePath(
//   "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.75/dist/"
// );
import ShoelaceModelDirective from "@shoelace-style/vue-sl-model";
Vue.config.ignoredElements = [/^sl-/];
Vue.use(ShoelaceModelDirective);

import TitleField from "@/components/fields/TitleField.vue";
Vue.component("TitleField", TitleField);
import TextField from "@/components/fields/TextField.vue";
Vue.component("TextField", TextField);
import MetaFieldHeader from "@/components/fields/MetaFieldHeader.vue";
Vue.component("MetaFieldHeader", MetaFieldHeader);
import SaveCancelButtons from "@/components/fields/SaveCancelButtons.vue";
Vue.component("SaveCancelButtons", SaveCancelButtons);

import axios from "axios";
const instance = axios.create({
  baseURL: window.location.origin + "/api2",
  // headers: {
  //   Origin: window.location.origin,
  // },
});
Vue.prototype.$axios = instance;

new Vue({
  router,
  i18n: i18n(),
  render: (h) => h(App),
  data: {
    store: window.store,
  },
  mounted() {
    this.$socketio.connect();
  },
}).$mount("#app");
