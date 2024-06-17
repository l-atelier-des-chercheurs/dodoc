import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import "./utils/icons";

Vue.config.productionTip = false;

const debug_mode = window.app_infos.debug_mode;
Vue.prototype.$eventHub = new Vue(); // Global event bus

import {
  i18n,
  changeLocale,
  findMissingTranslations,
} from "@/adc-core/lang/i18n.js";

import alertify from "alertify.js";
Vue.prototype.$alertify = alertify;

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
    if (
      event.target.tagName === "A" &&
      event.target.target === "_blank" &&
      !event.target.download
    ) {
      event.preventDefault();
      window.electronAPI.send("toMain", {
        type: "open_external",
        url: event.target.href,
      });
    }
  });

import api from "@/adc-core/api.js";
Vue.prototype.$api = api();

import TitleField from "@/adc-core/fields/TitleField.vue";
Vue.component("TitleField", TitleField);
import PickNativePath from "@/adc-core/fields/PickNativePath.vue";
Vue.component("PickNativePath", PickNativePath);
import AuthorField from "@/adc-core/fields/AuthorField.vue";
Vue.component("AuthorField", AuthorField);
import DetailsPane from "@/adc-core/ui/DetailsPane.vue";
Vue.component("DetailsPane", DetailsPane);
import DragFile from "@/adc-core/ui/DragFile.vue";
Vue.component("DragFile", DragFile);
import DropDown from "@/adc-core/ui/DropDown.vue";
Vue.component("DropDown", DropDown);
import AdminsAndContributorsField from "@/adc-core/fields/AdminsAndContributorsField.vue";
Vue.component("AdminsAndContributorsField", AdminsAndContributorsField);
import EditAdminsAndContributorsField from "@/adc-core/fields/EditAdminsAndContributorsField.vue";
Vue.component("EditAdminsAndContributorsField", EditAdminsAndContributorsField);
import StatusTag from "@/adc-core/fields/StatusTag.vue";
Vue.component("StatusTag", StatusTag);
import FavSwitch from "@/adc-core/fields/FavSwitch.vue";
Vue.component("FavSwitch", FavSwitch);
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
import DownloadFolder from "@/adc-core/fields/DownloadFolder.vue";
Vue.component("DownloadFolder", DownloadFolder);
import RemoveMenu from "@/adc-core/fields/RemoveMenu.vue";
Vue.component("RemoveMenu", RemoveMenu);
import TagsList from "@/adc-core/ui/TagsList.vue";
Vue.component("TagsList", TagsList);
import SingleTag from "@/adc-core/ui/SingleTag.vue";
Vue.component("SingleTag", SingleTag);
import ReorderedList from "@/adc-core/ui/ReorderedList.vue";
Vue.component("ReorderedList", ReorderedList);

import QRModal from "@/adc-core/modals/QRModal.vue";
Vue.component("QRModal", QRModal);
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
import PositionPicker from "@/adc-core/inputs/PositionPicker.vue";
Vue.component("PositionPicker", PositionPicker);
import ColorInput from "@/adc-core/inputs/ColorInput.vue";
Vue.component("ColorInput", ColorInput);
import SearchInput from "@/adc-core/inputs/SearchInput.vue";
Vue.component("SearchInput", SearchInput);

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
import ImportFolder from "@/adc-core/modals/ImportFolder";
Vue.component("ImportFolder", ImportFolder);
//

import SaveCancelButtons from "@/adc-core/fields/SaveCancelButtons.vue";
Vue.component("SaveCancelButtons", SaveCancelButtons);
import DateDisplay from "@/adc-core/fields/DateDisplay.vue";
Vue.component("DateDisplay", DateDisplay);
import SizeDisplay from "@/adc-core/fields/SizeDisplay.vue";
Vue.component("SizeDisplay", SizeDisplay);
import ResolutionDisplay from "@/adc-core/fields/ResolutionDisplay.vue";
Vue.component("ResolutionDisplay", ResolutionDisplay);
import DurationDisplay from "@/adc-core/fields/DurationDisplay.vue";
Vue.component("DurationDisplay", DurationDisplay);

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
import PickMediaFromProjects from "@/adc-core/fields/PickMediaFromProjects.vue";
Vue.component("PickMediaFromProjects", PickMediaFromProjects);

import EditBtn from "@/adc-core/ui/EditBtn.vue";
Vue.component("EditBtn", EditBtn);

Vue.component("LoaderSpinner", {
  name: "LoaderSpinner",
  template: `
  <div class="u-loader">
      <div class="_spinner" />
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
import Strings from "@/mixins/Strings";
Vue.mixin(Strings);
import Queries from "@/mixins/Queries";
Vue.mixin(Queries);
import Tags from "@/mixins/Tags";
Vue.mixin(Tags);
import Electron from "@/mixins/Electron";
Vue.mixin(Electron);

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
    debug_mode,

    publicPath: process.env.BASE_URL,

    modal_is_opened: false,
    has_file_dragover_on_window: false,

    current_time: "",

    default_new_module_width: 200,
    default_new_module_height: 200,
    default_new_module_left: 15,
    default_new_module_top: 15,
    set_new_module_offset_left: 0,
    set_new_module_offset_top: 0,
    zoom_offset: 50,

    page_magnification: 3.7952,

    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    },

    dropzones: [],

    publication_include_mode: "link",
  },
  created() {
    const getTime = () => new Date().getTime();
    this.current_time = getTime();
    setInterval(() => (this.current_time = getTime()), 1000);
  },
  mounted() {
    this.$eventHub.$on("modal.is_opened", this.modalIsOpened);
    this.$eventHub.$on("modal.is_closed", this.modalIsClosed);

    window.addEventListener("resize", () => {
      this.window.innerWidth = window.innerWidth;
      this.window.innerHeight = window.innerHeight;
    });

    let debounce_dragover = undefined;

    window.addEventListener("dragover", ($event) => {
      if (!$event.dataTransfer?.types?.includes("Files")) return;

      if (debounce_dragover) clearTimeout(debounce_dragover);
      this.has_file_dragover_on_window = true;
      debounce_dragover = setTimeout(async () => {
        this.has_file_dragover_on_window = false;
      }, 200);
    });
  },
  watch: {},
  computed: {
    is_mobile_view() {
      // return false;
      return this.window.innerWidth < 1000;
    },
  },
  methods: {
    modalIsOpened() {
      document.body.style.overflow = "hidden";
      this.modal_is_opened = true;
    },
    modalIsClosed() {
      document.body.style.overflow = "";
      this.modal_is_opened = false;
    },
    async changeLocale(lang) {
      await changeLocale(lang);
    },
    async findMissingTranslations() {
      const translations = await findMissingTranslations();
      return translations;
    },
    registerDropzone({ id, allowed_types }) {
      this.dropzones.push({ id, allowed_types });
    },
    unregisterDropzone({ id: id_to_unregister }) {
      this.dropzones = this.dropzones.filter(
        ({ id }) => id !== id_to_unregister
      );
    },
    fileCanBeDragged({ type }) {
      // never enable drag when a modal is opened
      if (this.modal_is_opened) return false;
      return this.dropzones.some(
        ({ allowed_types }) => !allowed_types || allowed_types.includes(type)
      );
    },
  },
}).$mount("#app");
