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
Vue.component("LoaderSpinner", {
  name: "LoaderSpinner",
  template: `
    <div class="_loader">
      <span class="loader" />
    </div>
  `,
});

import FormatDates from "./mixins/FormatDates";
Vue.mixin(FormatDates);

import "axios-debug-log/enable";
import axios from "axios";
const instance = axios.create({
  baseURL: window.location.origin + "/_api2",
  // headers: {
  //   Origin: window.location.origin,
  // },
});

instance.interceptors.request.use((request) => {
  alertify.delay(4000).log(
    `⤒ — ${request.method} + ${request.url}
      ${request.data ? `+ ` + JSON.stringify(request.data).slice(0, 20) : ""}
      `
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
    is_electron: navigator.userAgent.toLowerCase().indexOf(" electron/") > -1,
    dev_mode: true,

    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    },
  },
  mounted() {
    this.$api.init();
    this.$eventHub.$on("socketio.connect", this.socketConnected);
    this.$eventHub.$on("socketio.reconnect", this.socketConnected);
    this.$eventHub.$on("socketio.disconnect", this.socketDisconnected);
    this.$eventHub.$on("socketio.connect_error", this.socketConnectError);

    window.addEventListener("resize", () => {
      this.window.innerWidth = window.innerWidth;
      this.window.innerHeight = window.innerHeight;
    });
  },
  watch: {
    "$api.socket.connected": function () {
      this.is_connected = this.$api.socket.connected;
    },
  },
  computed: {
    is_mobile_view() {
      return this.window.innerWidth < 700;
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
    formatBytes(a, b) {
      if (0 == a) return `0 ${this.$t("bytes")}`;

      var e = [
        this.$t("bytes"),
        this.$t("kb"),
        this.$t("mb"),
        this.$t("gb"),
        "TB",
        "PB",
        "EB",
        "ZB",
        "YB",
      ];

      var c = 1024,
        d = b || 2,
        f = Math.floor(Math.log(a) / Math.log(c));
      return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
    },
  },
}).$mount("#app");
