import Vue from "vue";
import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

const debug_mode = window.app_infos.debug_mode;
Vue.prototype.$eventHub = new Vue(); // Global event bus

import i18n from "./adc-core/i18n.js";

import alertify from "alertify.js";
Vue.prototype.$alertify = alertify;

import api from "./adc-core/api.js";
Vue.prototype.$api = api();

import ShoelaceModelDirective from "@shoelace-style/vue-sl-model";
Vue.config.ignoredElements = [/^sl-/];
Vue.use(ShoelaceModelDirective);

import TitleField from "@/adc-core/fields/TitleField.vue";
Vue.component("TitleField", TitleField);
import AuthorField from "@/adc-core/fields/AuthorField.vue";
Vue.component("AuthorField", AuthorField);
import TagsField from "@/adc-core/fields/TagsField.vue";
Vue.component("TagsField", TagsField);
import CoverField from "@/adc-core/fields/CoverField.vue";
Vue.component("CoverField", CoverField);
import SelectField from "@/adc-core/fields/SelectField.vue";
Vue.component("SelectField", SelectField);
import ToggleField from "@/adc-core/fields/ToggleField.vue";
Vue.component("ToggleField", ToggleField);
import RadioField from "@/adc-core/fields/RadioField.vue";
Vue.component("RadioField", RadioField);
import DebugBtn from "@/adc-core/DebugBtn.vue";
Vue.component("DebugBtn", DebugBtn);
//
import BaseModal2 from "@/adc-core/modal/BaseModal2.vue";
Vue.component("BaseModal2", BaseModal2);
//
import TextInput from "@/adc-core/inputs/TextInput.vue";
Vue.component("TextInput", TextInput);
import ToggleInput from "@/adc-core/inputs/ToggleInput.vue";
Vue.component("ToggleInput", ToggleInput);
import AuthorPicker from "@/adc-core/inputs/AuthorPicker.vue";
Vue.component("AuthorPicker", AuthorPicker);
//

import SaveCancelButtons from "@/adc-core/fields/SaveCancelButtons.vue";
Vue.component("SaveCancelButtons", SaveCancelButtons);

import DateField from "@/adc-core/fields/DateField.vue";
Vue.component("DateField", DateField);

import UploadFiles from "@/adc-core/fields/UploadFiles.vue";
Vue.component("UploadFiles", UploadFiles);

import MediaContent from "@/adc-core/fields/MediaContent.vue";
Vue.component("MediaContent", MediaContent);

import AuthorTag from "@/adc-core/fields/AuthorTag.vue";
Vue.component("AuthorTag", AuthorTag);

Vue.component("EditBtn", {
  name: "EditBtn",
  template: `
  <sl-button variant="edit" class="editBtn" size="small" circle @click="$emit('click')">
    <sl-icon name="pencil-fill" :label="$t('edit')" />
  </sl-button>
`,
});
Vue.component("LoaderSpinner", {
  name: "LoaderSpinner",
  template: `<sl-spinner style="--indicator-color: currentColor" />`,
});

import FormatDates from "./mixins/FormatDates";
Vue.mixin(FormatDates);
import Medias from "./mixins/Medias";
Vue.mixin(Medias);
import Authors from "./mixins/Authors";
Vue.mixin(Authors);

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};

import "axios-debug-log/enable";
import axios from "axios";
const instance = axios.create({
  baseURL: window.location.origin + "/_api2",
  // headers: {
  //   Origin: window.location.origin,
  // },
});

instance.interceptors.request.use((request) => {
  if (debug_mode)
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
    publicPath: process.env.BASE_URL,

    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    },
  },
  mounted() {
    this.$api.init({ debug_mode });
    this.$eventHub.$on("socketio.connect", this.socketConnected);
    this.$eventHub.$on("socketio.reconnect", this.socketConnected);
    this.$eventHub.$on("socketio.disconnect", this.socketDisconnected);
    this.$eventHub.$on("socketio.connect_error", this.socketConnectError);

    const html = document.documentElement; // returns the html tag
    html.setAttribute("lang", "fr");

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
      return false;
      // return this.window.innerWidth < 700;
    },
  },
  methods: {
    socketConnected() {
      if (this.debug_mode)
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
