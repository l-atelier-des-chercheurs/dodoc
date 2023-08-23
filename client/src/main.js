import Vue from "vue";
import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

const debug_mode = window.app_infos.debug_mode;
Vue.prototype.$eventHub = new Vue(); // Global event bus

import i18n from "@/adc-core/lang/i18n.js";

import alertify from "alertify.js";
Vue.prototype.$alertify = alertify;

Vue.config.ignoredElements = [/sl-/];
// todo : replace shoelace components
/*
  sl-spinner
  sl-icon
  sl-icon-button
  sl-tab
  sl-tab-group
  sl-tab-panel
*/
import { IconsPlugin } from "bootstrap-vue";
Vue.use(IconsPlugin);
// import { BootstrapVueIcons } from "bootstrap-vue";
// import "bootstrap-vue/dist/bootstrap-vue-icons.min.css";
// Vue.use(BootstrapVueIcons);

import PortalVue from "portal-vue";
Vue.use(PortalVue);

import VuePlyr from "vue-plyr";
Vue.use(VuePlyr, {
  plyr: {
    controls: [
      "play-large",
      "play",
      "progress",
      "current-time",
      "mute",
      "volume",
      "fullscreen",
    ],
    iconUrl: `${process.env.BASE_URL}plyr.svg`,
  },
});
Vue.directive("uppercase", {
  bind(el, _, vnode) {
    el.addEventListener("input", (e) => {
      e.target.value = e.target.value.toUpperCase();
      vnode.componentInstance.$emit("input", e.target.value.toUpperCase());
    });
  },
});

if (window.app_infos.is_electron)
  document.body.addEventListener("click", (event) => {
    event.path.every((item) => {
      if (item.tagName === "A" && item.target === "_blank" && !item.download) {
        event.preventDefault();
        window.electronAPI.send("toMain", {
          type: "open_external",
          url: item.href,
        });
      }
    });
  });

import api from "@/adc-core/api.js";
Vue.prototype.$api = api();

import VueQrcode from "@chenfengyuan/vue-qrcode";
Vue.component(VueQrcode.name, VueQrcode);

import TitleField from "@/adc-core/fields/TitleField.vue";
Vue.component("TitleField", TitleField);
import MarkdownField from "@/adc-core/fields/MarkdownField.vue";
Vue.component("MarkdownField", MarkdownField);
import PickNativePath from "@/adc-core/fields/PickNativePath.vue";
Vue.component("PickNativePath", PickNativePath);
import AuthorField from "@/adc-core/fields/AuthorField.vue";
Vue.component("AuthorField", AuthorField);
import DetailsPane from "@/adc-core/ui/DetailsPane.vue";
Vue.component("DetailsPane", DetailsPane);
import AdminsAndContributorsField from "@/adc-core/fields/AdminsAndContributorsField.vue";
Vue.component("AdminsAndContributorsField", AdminsAndContributorsField);
import EditAdminsAndContributorsField from "@/adc-core/fields/EditAdminsAndContributorsField.vue";
Vue.component("EditAdminsAndContributorsField", EditAdminsAndContributorsField);
import StatusTag from "@/adc-core/fields/StatusTag.vue";
Vue.component("StatusTag", StatusTag);
import TagsField from "@/adc-core/fields/TagsField.vue";
Vue.component("TagsField", TagsField);
import CoverField from "@/adc-core/fields/CoverField.vue";
Vue.component("CoverField", CoverField);
import SelectField from "@/adc-core/fields/SelectField.vue";
Vue.component("SelectField", SelectField);
import SelectField2 from "@/adc-core/fields/SelectField2.vue";
Vue.component("SelectField2", SelectField2);
import ToggleField from "@/adc-core/fields/ToggleField.vue";
Vue.component("ToggleField", ToggleField);
import RadioCheckboxField from "@/adc-core/fields/RadioCheckboxField.vue";
Vue.component("RadioCheckboxField", RadioCheckboxField);
import RadioCheckboxInput from "@/adc-core/inputs/RadioCheckboxInput.vue";
Vue.component("RadioCheckboxInput", RadioCheckboxInput);
import FilesModule from "@/adc-core/fields/FilesModule.vue";
Vue.component("FilesModule", FilesModule);
import DebugBtn from "@/adc-core/DebugBtn.vue";
Vue.component("DebugBtn", DebugBtn);
import RemoveMenu from "@/adc-core/fields/RemoveMenu.vue";
Vue.component("RemoveMenu", RemoveMenu);
import TagsList from "@/adc-core/ui/TagsList.vue";
Vue.component("TagsList", TagsList);
import SingleTag from "@/adc-core/ui/SingleTag.vue";
Vue.component("SingleTag", SingleTag);

import QRModal from "@/adc-core/modals/QRModal.vue";
Vue.component("QRModal", QRModal);
import QRCodeWithLink from "@/adc-core/ui/QRCodeWithLink.vue";
Vue.component("QRCodeWithLink", QRCodeWithLink);
//
import BaseModal2 from "@/adc-core/modals/BaseModal2.vue";
Vue.component("BaseModal2", BaseModal2);
import RadioSwitch from "@/adc-core/ui/RadioSwitch.vue";
Vue.component("RadioSwitch", RadioSwitch);
import DropZone from "@/adc-core/ui/DropZone.vue";
Vue.component("DropZone", DropZone);
import AnimatedCounter from "@/adc-core/ui/AnimatedCounter.vue";
Vue.component("AnimatedCounter", AnimatedCounter);
//
import TextInput from "@/adc-core/inputs/TextInput.vue";
Vue.component("TextInput", TextInput);
import NumberInput from "@/adc-core/inputs/NumberInput.vue";
Vue.component("NumberInput", NumberInput);
import ColorInput from "@/adc-core/inputs/ColorInput.vue";
Vue.component("ColorInput", ColorInput);

import ToggleInput from "@/adc-core/inputs/ToggleInput.vue";
Vue.component("ToggleInput", ToggleInput);
import ToggledSection from "@/adc-core/inputs/ToggledSection.vue";
Vue.component("ToggledSection", ToggledSection);
import RangeValueInput from "@/adc-core/inputs/RangeValueInput.vue";
Vue.component("RangeValueInput", RangeValueInput);
import AuthorPicker from "@/adc-core/inputs/AuthorPicker.vue";
Vue.component("AuthorPicker", AuthorPicker);
import CreateFolder from "@/adc-core/modals/CreateFolder";
Vue.component("CreateFolder", CreateFolder);
//

import SaveCancelButtons from "@/adc-core/fields/SaveCancelButtons.vue";
Vue.component("SaveCancelButtons", SaveCancelButtons);
import DateDisplay from "@/adc-core/fields/DateDisplay.vue";
Vue.component("DateDisplay", DateDisplay);
import DateField from "@/adc-core/fields/DateField.vue";
Vue.component("DateField", DateField);
import UploadFiles from "@/adc-core/fields/UploadFiles.vue";
Vue.component("UploadFiles", UploadFiles);
import MediaContent from "@/adc-core/fields/MediaContent.vue";
Vue.component("MediaContent", MediaContent);
import FullscreenView from "@/adc-core/fields/FullscreenView.vue";
Vue.component("FullscreenView", FullscreenView);
import CollaborativeEditor2 from "@/adc-core/fields/collaborative-editor/CollaborativeEditor2.vue";
Vue.component("CollaborativeEditor2", CollaborativeEditor2);
import AuthorTag from "@/adc-core/fields/AuthorTag.vue";
Vue.component("AuthorTag", AuthorTag);
import DLabel from "@/adc-core/fields/DLabel.vue";
Vue.component("DLabel", DLabel);
import DownloadFile from "@/adc-core/fields/DownloadFile.vue";
Vue.component("DownloadFile", DownloadFile);
import ImageSelect from "@/adc-core/fields/ImageSelect.vue";
Vue.component("ImageSelect", ImageSelect);
// import PickMediaFromProjects from "@/adc-core/fields/PickMediaFromProjects.vue";
// Vue.component("PickMediaFromProjects", PickMediaFromProjects);

import EditBtn from "@/adc-core/ui/EditBtn.vue";
Vue.component("EditBtn", EditBtn);

Vue.component("LoaderSpinner", {
  name: "LoaderSpinner",
  template: `
  <div class="u-loader">
    <sl-spinner style="font-size: 2rem; --track-width: 5px; --indicator-color: currentColor" />
  </div>
  `,
});

document.addEventListener(
  "dragover",
  function (event) {
    event.preventDefault();
    return false;
  },
  false
);
document.addEventListener(
  "drop",
  function (event) {
    event.preventDefault();
    return false;
  },
  false
);

import FormatDates from "@/mixins/FormatDates";
Vue.mixin(FormatDates);
import FormatBytes from "@/mixins/FormatBytes";
Vue.mixin(FormatBytes);
import Props from "@/mixins/Props";
Vue.mixin(Props);
import Cache from "@/mixins/Cache";
Vue.mixin(Cache);
import Medias from "@/mixins/Medias";
Vue.mixin(Medias);
import Authors from "@/mixins/Authors";
Vue.mixin(Authors);
import Capture from "@/mixins/Capture";
Vue.mixin(Capture);
import Publications from "@/mixins/Publications";
Vue.mixin(Publications);
import Paths from "@/mixins/Paths";
Vue.mixin(Paths);

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
      ${request.data ? `+ ` + JSON.stringify(request.data).slice(0, 30) : ""}
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
    is_loading: true,
    dev_mode: true,
    publicPath: process.env.BASE_URL,

    modal_is_opened: false,

    current_time: "",

    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    },
  },
  created() {
    const getTime = () => new Date().getTime();
    this.current_time = getTime();
    setInterval(() => (this.current_time = getTime()), 1000);
  },
  async mounted() {
    await this.$api.init({ debug_mode });
    this.is_loading = false;
    if (!this.connected_as) this.$eventHub.$emit(`showAuthorModal`);

    this.$eventHub.$on("socketio.connect", this.socketConnected);
    this.$eventHub.$on("socketio.reconnect", this.socketConnected);
    this.$eventHub.$on("socketio.disconnect", this.socketDisconnected);
    this.$eventHub.$on("socketio.connect_error", this.socketConnectError);
    this.$eventHub.$on("modal.is_opened", this.modalIsOpened);
    this.$eventHub.$on("modal.is_closed", this.modalIsClosed);
    const html = document.documentElement; // returns the html tag
    html.setAttribute("lang", "fr");

    window.addEventListener("resize", () => {
      this.window.innerWidth = window.innerWidth;
      this.window.innerHeight = window.innerHeight;
    });
  },
  watch: {},
  computed: {
    is_mobile_view() {
      // return false;
      return this.window.innerWidth < 600;
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
    modalIsOpened() {
      document.body.style.overflow = "hidden";
      this.modal_is_opened = true;
    },
    modalIsClosed() {
      document.body.style.overflow = "";
      this.modal_is_opened = false;
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
