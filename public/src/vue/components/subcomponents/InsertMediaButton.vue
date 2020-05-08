<template>
  <div class="m_insertMediaButton" :class="{ 'is--open': show_menu }">
    <button
      type="button"
      class="m_insertMediaButton--toggleButton"
      :class="{ 'is--active': show_menu }"
      @click="show_menu = !show_menu"
      :content="$t('insert_medias_here')"
      v-tippy="{
        placement: 'bottom',
        delay: [600, 0],
      }"
    ></button>

    <transition name="fade_fast" :duration="150">
      <div class="m_insertMediaButton--menu" v-if="show_menu">
        <div v-show="$root.state.connected" class="m_actionbar">
          <div class="m_actionbar--buttonBar">
            <button
              type="button"
              class="barButton barButton_capture"
              @click="openCapture"
              :disabled="is_iOS_device"
            >
              <span>{{ $t("capture") }}</span>
            </button>

            <label
              class="barButton barButton_import button"
              :id="`insert_file_${id}`"
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
                accept=""
                style="width: 1px; height: 1px; overflow: hidden;"
              />
            </label>

            <transition name="fade_fast" :duration="150">
              <div
                v-if="!read_only && show_drop_container && can_edit_project"
                @drop="dropHandler($event)"
                class="_drop_indicator"
              >
                <div>
                  <img src="/images/i_importer.svg" draggable="false" />
                  <label>{{ $t("drop_here_to_import") }}</label>
                </div>
              </div>
            </transition>

            <UploadFile
              v-if="selected_files.length > 0"
              :slugFolderName="slugPubliName"
              :type="'publications'"
              :selected_files="selected_files"
              @close=""
              @insertMedias="(medias) => insertImportedMedias({ medias })"
            />

            <button
              type="button"
              class="barButton barButton_text"
              @click="createTextMedia"
            >
              <span>{{ $t("create_text") }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import UploadFile from "./UploadFile.vue";

export default {
  props: {
    is_collapsed: {
      type: Boolean,
      default: true,
    },
    slugPubliName: String,
  },
  components: {
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
    };
  },
  created() {},
  mounted() {
    document.addEventListener("dragover", this.ondragover);
  },
  beforeDestroy() {
    document.removeEventListener("dragover", this.ondragover);
  },
  watch: {},
  computed: {},
  methods: {
    createTextMedia() {
      this.$emit("addMedia", {
        type: "text",
      });

      this.show_menu = false;
    },
    insertImportedMedias({ medias }) {
      this.selected_files = [];
      this.$emit("insertMedias", { medias });
      this.show_menu = false;
    },
    openCapture() {},
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
