import Vue from "vue";
import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

Vue.prototype.$eventHub = new Vue(); // Global event bus

import i18n from "./adc-core/i18n.js";

import alertify from "alertify.js";
Vue.prototype.$alertify = alertify;

import api from "./adc-core/api.js";
Vue.prototype.$api = api();

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
import DateField from "@/components/fields/DateField.vue";
Vue.component("DateField", DateField);

import "axios-debug-log/enable";
import axios from "axios";
const instance = axios.create({
  baseURL: window.location.origin + "/_api2",
  // headers: {
  //   Origin: window.location.origin,
  // },
});
instance.interceptors.request.use((request) => {
  alertify
    .delay(4000)
    .success(
      `${request.method} + ${request.url} + ${
        request.data ? JSON.stringify(request.data) : "no-data"
      }`
    );
  return request;
});
Vue.prototype.$axios = instance;

new Vue({
  router,
  i18n: i18n(),
  render: (h) => h(App),
  data: {
    store: window.store,
    app_infos: window.app_infos,
    is_connected: false,
  },
  mounted() {
    this.$api.init();
    this.$eventHub.$on("socketio.connect", this.socketConnected);
    this.$eventHub.$on("socketio.reconnect", this.socketConnected);
    this.$eventHub.$on("socketio.disconnect", this.socketDisconnected);
    this.$eventHub.$on("socketio.connect_error", this.socketConnectError);
  },
  watch: {
    "$api.socket.connected": function () {
      this.is_connected = this.$api.socket.connected;
    },
  },
  methods: {
    socketConnected() {
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(`Connected or reconnected with id ${this.$api.socket.id}`);
    },
    socketDisconnected(reason) {
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .error(`Disconnected ${reason}`);
    },
    socketConnectError(reason) {
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .error(`Connect error ${reason}`);
    },
  },
}).$mount("#app");
