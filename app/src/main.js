import Vue from "vue";
import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

console.log("plop");

new Vue({
  router,
  render: (h) => h(App),
  data: {
    url_to_api: window.location.origin + "/api",
  },
}).$mount("#app");
