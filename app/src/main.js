import Vue from "vue";
import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

import custom_socketio from "./adc-core/socketio.js";
Vue.prototype.$socketio = custom_socketio();

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
  render: (h) => h(App),
  data: {
    store: window.store,
  },
  mounted() {
    this.$socketio.connect();
  },
}).$mount("#app");
