<template>
  <div
    class="m_insertMediaButton"
    :class="{
      'is--open': show_menu,
      'is--dragover': show_drop_container,
    }"
  >
    <div
      class="m_insertMediaButton--importHere"
      v-if="!show_menu"
      :class="{
        'is--active': is_currently_active && !show_drop_container,
      }"
    />
    <button
      type="button"
      class="m_insertMediaButton--toggleButton"
      :class="{ 'is--active': show_menu }"
      @click="toggleMenu"
      :content="!show_menu ? $t('insert_medias_here') : ''"
      v-tippy="{
        placement: 'bottom',
        delay: [600, 0],
      }"
    ></button>
    <!-- <button
      type="button"
      class="buttonLink _cancel_capture_button"
      v-if="enable_capture_mode"
      @click="enable_capture_mode = false"
    >
      {{ $t("cancel") }}
    </button>-->
    <transition name="fade_fast" :duration="150" mode="out-in">
      <div
        v-if="show_drop_container"
        @drop="dropHandler($event)"
        class="_drop_indicator"
      >
        <div>
          <img src="/images/i_importer.svg" draggable="false" />
          <label>{{ $t("drop_here_to_import") }}</label>
        </div>
        <div class="ta-ce padding-sides-small" v-if="publi_follows_model">
          <small class="c-noir">
            <span v-html="$t('type_of_expected_contents:')" />

            <template v-if="modes_allowed === 'all'">{{ $t("all") }}</template>
            <span
              v-else
              v-for="(mode, index) in Object.keys(modes_allowed)"
              :key="mode"
              v-html="(index > 0 ? ', ' : '') + $t(mode)"
            />
          </small>
        </div>
      </div>

      <div
        class="m_insertMediaButton--menu"
        v-else-if="
          show_menu && selected_files.length === 0 && !enable_capture_mode
        "
      >
        <div v-show="$root.state.connected" class="m_actionbar">
          <div class="m_actionbar--buttonBar">
            <button
              type="button"
              class="barButton barButton_capture"
              v-if="
                !publi_follows_model ||
                modes_allowed === 'all' ||
                Object.keys(modes_allowed).some((m) =>
                  ['photo', 'video', 'stopmotion', 'audio', 'vecto'].includes(m)
                )
              "
              @click="toggleCapture"
              :class="{ 'is--disabled': is_iOS_device }"
            >
              <span>{{ $t("capture") }}</span>
            </button>

            <label
              class="barButton barButton_import button"
              :id="`insert_file_${id}`"
              v-if="
                !(
                  Object.keys(modes_allowed).length === 1 &&
                  Object.keys(modes_allowed)[0] === 'text'
                )
              "
            >
              <span>
                {{ $t("import") }}
                <!-- <div v-html="field.svg" /> -->
              </span>
              <input
                type="file"
                multiple
                :id="`insert_file_${id}`"
                name="file"
                @change="updateInputFiles($event)"
                accept
                style="width: 1px; height: 1px; overflow: hidden"
              />
            </label>

            <button
              type="button"
              class="barButton barButton_text"
              v-if="
                !publi_follows_model ||
                modes_allowed === 'all' ||
                modes_allowed.hasOwnProperty('text')
              "
              @click="createTextMedia"
            >
              <span>{{ $t("write") }}</span>
            </button>
            <button
              type="button"
              v-if="!publi_follows_model"
              class="barButton barButton_divider"
              @click="createDivider"
            >
              <span>{{ $t("divider") }}</span>
            </button>

            <button
              type="button"
              v-if="publi_is_model"
              class="barButton barButton_placeholder"
              @click="createPlaceholderMedia"
            >
              <span>{{ $t("placeholder") }}</span>
            </button>
          </div>
          <!-- <small v-if="!is_iOS_device">
            {{ $t("notifications.ios_not_compatible_with_capture") }}
          </small>-->
          <!-- <div class="ta-ce padding-sides-small" v-if="publi_follows_model">
            <small class="c-noir">
              <span v-html="$t('type_of_expected_contents:')" />
              <template v-if="modes_allowed === 'all'">
                {{
                $t("all")
                }}
              </template>
              <span
                v-else
                v-for="(mode, index) in Object.keys(modes_allowed)"
                :key="mode"
                v-html="(index > 0 ? ', ' : '') + $t(mode)"
              />
            </small>
          </div>-->
        </div>
      </div>
      <UploadFile
        v-else-if="selected_files.length > 0"
        class="m_insertMediaButton--uploadFile"
        :slugFolderName="slugPubliName"
        :type="'publications'"
        :selected_files="selected_files"
        @insertMedias="
          (metaFileNames) => insertImportedMedias({ metaFileNames })
        "
      />
      <template v-else-if="enable_capture_mode">
        <!-- v-if="captureview_in_modal === false && false" -->
        <component
          :is="!captureview_in_modal ? 'CaptureView2' : 'CaptureViewModal'"
          class="is--collapsed"
          :slugFolderName="slugPubliName"
          :type="`publications`"
          :read_only="read_only"
          :can_add_to_fav="false"
          :available_modes="
            modes_allowed !== 'all'
              ? Object.keys(modes_allowed).filter(
                  (m) => m !== 'text' && m !== 'file'
                )
              : undefined
          "
          @insertMedias="
            (metaFileNames) => insertImportedMedias({ metaFileNames })
          "
          @close="enable_capture_mode = false"
        />
      </template>
    </transition>
  </div>
</template>
<script>
import CaptureView2 from "../../CaptureView2.vue";
import CaptureViewModal from "../modals/CaptureViewModal.vue";
import UploadFile from "./UploadFile.vue";
import debounce from "debounce";

export default {
  props: {
    is_collapsed: {
      type: Boolean,
      default: true,
    },
    can_collapse: {
      type: Boolean,
      default: true,
    },
    publi_is_model: {
      type: Boolean,
      default: false,
    },
    publi_follows_model: {
      type: Boolean,
      default: false,
    },
    captureview_in_modal: {
      type: Boolean,
      default: false,
    },
    is_currently_active: Boolean,
    slugPubliName: String,
    modes_allowed: {
      type: [String, Object],
      default: "all",
    },
  },
  components: {
    CaptureView2,
    CaptureViewModal,
    UploadFile,
  },
  data() {
    return {
      show_menu: !this.is_collapsed,
      selected_files: [],

      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 8),

      is_iOS_device:
        !!window.navigator.platform &&
        /iPad|iPhone|iPod/.test(navigator.platform),

      show_drop_container: false,
      enable_capture_mode: false,
    };
  },
  created() {},
  mounted() {
    document.addEventListener("dragover", this.ondragover);

    this.cancelDragOver = debounce(this.cancelDragOver, 300);
  },
  beforeDestroy() {
    document.removeEventListener("dragover", this.ondragover);
  },
  watch: {
    can_collapse: {
      handler() {
        if (!this.can_collapse) this.show_menu = true;
      },
      immediate: true,
    },
  },
  computed: {},
  methods: {
    createTextMedia() {
      let val = {
        type: "text",
      };
      if (this.modes_allowed && this.modes_allowed !== "all") {
        if (this.modes_allowed.text) {
          if (this.modes_allowed.text.advanced_text_options === "false")
            val.plain_text = true;
          if (this.modes_allowed.text.force_text_style)
            val.force_text_style = this.modes_allowed.text.force_text_style;
          if (this.modes_allowed.text.only_numbers === "true")
            val.only_numbers = true;
        }
      }
      this.$emit("addMedia", val);

      this.show_menu = false;
    },
    createPlaceholderMedia() {
      this.$emit("addMedia", {
        type: "placeholder",
      });

      this.show_menu = false;
    },
    createDivider() {
      this.$emit("addMedia", {
        type: "divider",
      });

      this.show_menu = false;
    },
    insertImportedMedias({ metaFileNames }) {
      this.selected_files = [];
      this.show_menu = false;
      this.enable_capture_mode = false;
      setTimeout(() => {
        this.$emit("insertMedias", { metaFileNames });
      }, 500);
    },
    toggleMenu() {
      this.show_menu = !this.show_menu;
      this.enable_capture_mode = false;
      this.selected_files = [];
    },
    toggleCapture() {
      if (this.is_iOS_device) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(8000)
          .error(this.$t("notifications.ios_not_compatible_with_capture"));
        setTimeout(() => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(8000)
            .success(this.$t("notifications.instead_import_with_this_button"));
        }, 1500);

        return;
      }

      this.enable_capture_mode = !this.enable_capture_mode;
    },
    updateInputFiles($event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`InsertMediaButton • METHODS / updateInputFiles`);

      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    ondragover() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`InsertMediaButton • METHODS / ondragover`);

      this.show_drop_container = true;
      this.cancelDragOver();
    },
    cancelDragOver() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`InsertMediaButton • METHODS / cancelDragOver`);

      this.show_drop_container = false;
    },
    dropHandler($event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`InsertMediaButton • METHODS / dropHandler`);

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();

      if ($event.dataTransfer.items) {
        let files = [];
        for (var i = 0; i < $event.dataTransfer.items.length; i++) {
          if ($event.dataTransfer.items[i].kind === "file") {
            files.push($event.dataTransfer.items[i].getAsFile());
          }
        }
        this.selected_files = files;
      } else {
        for (var i = 0; i < $event.dataTransfer.files.length; i++) {
          this.selected_files = Array.from($event.dataTransfer.files);
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
