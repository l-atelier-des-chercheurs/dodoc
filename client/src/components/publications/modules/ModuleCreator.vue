<template>
  <div
    class="_moduleCreator"
    :class="{
      'is--collapsed': !show_module_selector,
    }"
  >
    <transition name="pagechange" mode="out-in">
      <div v-if="show_module_selector || !start_collapsed" class="_typePicker">
        <button
          type="button"
          class="u-button u-button_red"
          v-if="types_available.includes('capture')"
          @click="show_capture_modal = true"
        >
          <b-icon
            icon="record-circle-fill"
            style="font-size: var(--icon-size)"
          />
          <template v-if="show_labels">{{ $t("capture") }}</template>
        </button>
        <CaptureModal
          v-if="show_capture_modal"
          :path="project_path"
          :available_modes="available_modes"
          @createMosaic="createMosaic"
          @close="show_capture_modal = false"
        />

        <button
          type="button"
          class="u-button u-button_orange"
          v-if="types_available.includes('import')"
          @click="show_media_picker = true"
        >
          <b-icon icon="image" style="font-size: var(--icon-size)" />
          <template v-if="show_labels">{{ $t("import") }}</template>
        </button>
        <MediaPicker
          v-if="show_media_picker"
          :publication_path="publication_path"
          :select_mode="select_mode"
          :pick_from_types="pick_from_types"
          @addMedias="createMosaic"
          @close="show_media_picker = false"
        />

        <button
          type="button"
          class="u-button u-button_bleuvert"
          v-if="types_available.includes('write')"
          @click="createText"
        >
          <b-icon icon="fonts" style="font-size: var(--icon-size)" />
          <template v-if="show_labels">{{ $t("write") }}</template>
        </button>

        <button
          type="button"
          class="u-button u-button_bleuvert"
          v-if="types_available.includes('embed')"
          @click="show_link_picker = true"
        >
          <b-icon icon="link" style="font-size: var(--icon-size)" />
          <template v-if="show_labels">{{ $t("embed") }}</template>
        </button>
        <EmbedPicker
          v-if="show_link_picker"
          @embed="createEmbed"
          @close="show_link_picker = false"
        />

        <button
          type="button"
          class="u-button u-button_bleuvert"
          v-if="types_available.includes('table')"
          @click="createTable"
        >
          <b-icon icon="table" style="font-size: var(--icon-size)" />
          <template v-if="show_labels">{{ $t("table") }}</template>
        </button>

        <template v-if="types_available.includes('shapes')">
          <button
            type="button"
            v-for="shape in shapes"
            :key="shape.type"
            class="u-button u-button_bleumarine"
            @click="
              createCustomModule({
                module_type: shape.type,
                addtl_meta: shape.addtl_meta,
              })
            "
          >
            <b-icon :icon="shape.icon" style="font-size: var(--icon-size)" />
            <template v-if="show_labels">{{ $t(shape.type) }}</template>
            <!-- {{ $t("add_medias") }} -->
          </button>
        </template>
        <EditBtn
          v-if="start_collapsed"
          key="addmodule"
          :btn_type="'close'"
          :is_unfolded="false"
          @click="show_module_selector = false"
        />
      </div>
      <EditBtn
        v-else-if="start_collapsed && !show_module_selector"
        key="addmodule"
        :btn_type="'add'"
        :is_unfolded="false"
        class="_addBtn"
        @click="show_module_selector = true"
      />
    </transition>
    <DropZone class="_dropZone" @mediaDropped="mediaDropped" />
  </div>
</template>
<script>
import CaptureModal from "@/components/publications/CaptureModal.vue";
import MediaPicker from "@/components/publications/MediaPicker.vue";
import EmbedPicker from "@/adc-core/modals/EmbedPicker.vue";

export default {
  props: {
    publication_path: String,
    pre_addtl_meta: Object,
    post_addtl_meta: Object,
    select_mode: String,
    pick_from_types: [String, Array],
    available_modes: Array,
    show_labels: {
      type: Boolean,
      default: true,
    },
    context: String,
    types_available: {
      type: Array,
      default: () => ["capture", "import", "write", "embed", "table", "shapes"],
    },
    start_collapsed: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    CaptureModal,
    MediaPicker,
    EmbedPicker,
  },
  data() {
    return {
      show_capture_modal: false,
      show_module_selector: false,
      show_media_picker: false,
      show_file_picker: false,
      show_link_picker: false,

      shapes: [
        {
          type: "ellipsis",
          icon: "circle-fill",
          addtl_meta: {
            background_color: "#1d327f",
          },
        },
        {
          type: "rectangle",
          icon: "square-fill",
          addtl_meta: {
            background_color: "#ffbe32",
          },
        },
        {
          type: "line",
          icon: "dash-lg",
          addtl_meta: {
            outline_width: 1,
            outline_color: "#000000",
          },
        },
        {
          type: "arrow",
          icon: "arrow-right-square",
          addtl_meta: {
            outline_width: 1,
            outline_color: "#000000",
          },
        },
      ],

      // options: [
      //   {
      //     key: "mosaic",
      //     label: "module.label.mosaic",
      //     instructions: "module.instructions.mosaic",
      //   },
      //   {
      //     key: "carousel",
      //     label: "module.label.carousel",
      //     instructions: "module.instructions.carousel",
      //   },
      // ],

      is_saving: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    show_module_selector() {},
  },
  computed: {
    project_path() {
      if (this.$root.publication_include_mode === "link")
        return this.getParent(this.getParent(this.publication_path));
      return this.publication_path;
    },
  },
  methods: {
    async mediaDropped({ path_to_source_media_metas }) {
      // todo multiple cases here : if drag/drop media already in a publication, drag drop media from library
      this.createMosaic({ path_to_source_media_metas });
    },
    async createMosaic({ meta_filename, path_to_source_media_metas }) {
      // if meta_filename, file is stored in publication
      // if path_to_source_media, we get metafilename
      let source_medias = [];

      // each meta gets it own mosaic
      if (meta_filename) {
        source_medias.push({
          meta_filename,
        });
      } else if (path_to_source_media_metas) {
        for (const path_to_source_media_meta of path_to_source_media_metas) {
          const import_mode = this.$root.publication_include_mode;
          const new_entry = await this.prepareMediaForPublication({
            path_to_source_media_meta,
            publication_path: this.publication_path,
            import_mode,
          });
          source_medias.push(new_entry);
        }
      }
      if (this.context === "page_by_page") {
        source_medias = source_medias.map((sm) => {
          sm.objectFit = "contain";
          return sm;
        });
      }

      if (["page_by_page", "montage"].includes(this.context)) {
        await this.createMultipleModules({
          module_type: "mosaic",
          source_medias,
        });
      } else {
        await this.createModule({
          module_type: "mosaic",
          source_medias,
        });
      }

      this.show_media_picker = false;
    },
    async createEmbed(full_url) {
      const filename = "url-" + +new Date() + ".txt";

      const { meta_filename } = await this.$api.uploadText({
        path: this.publication_path,
        filename,
        content: full_url,
        additional_meta: {
          $type: "url",
        },
      });
      this.createMosaic({ meta_filename });
      this.show_link_picker = false;
    },
    async createFiles({ path_to_source_media_metas }) {
      // not used, need to update
      let source_medias = [];
      path_to_source_media_metas.map((path_to_source_media_meta) => {
        const meta_filename_in_project = this.getFilename(
          path_to_source_media_meta
        );
        source_medias.push({
          meta_filename_in_project,
        });
      });

      await this.createModule({
        module_type: "files",
        source_medias,
      });

      this.show_file_picker = false;
    },

    async createCustomModule({ module_type, addtl_meta }) {
      await this.createModule({
        module_type,
        addtl_meta,
      });
    },
    async createText() {
      const filename = "text-" + +new Date() + ".txt";
      const { meta_filename } = await this.$api.uploadText({
        path: this.publication_path,
        filename,
        content: "",
      });
      const source_medias = [{ meta_filename }];

      const module_type = this.context === "page_by_page" ? "text" : "mosaic";
      await this.createModule({
        module_type,
        source_medias,
      });
    },
    async createTable() {
      const filename = "table-" + +new Date() + ".json";

      const { meta_filename } = await this.$api.uploadText({
        path: this.publication_path,
        filename,
        content: JSON.stringify(
          [
            [{ content: "" }, { content: "" }],
            [{ content: "" }, { content: "" }],
          ],
          null,
          4
        ),
        additional_meta: {
          $type: "table",
        },
      });
      this.createMosaic({ meta_filename });
      this.show_link_picker = false;
    },

    async createModule({ module_type, source_medias = [], addtl_meta = {} }) {
      // get infos from first media
      if (source_medias.length > 0) {
        const media = this.getSourceMedia({
          source_media: source_medias[0],
          folder_path: this.publication_path,
        });
        if (media?.$location) addtl_meta.location = media.$location;
      }

      const meta_filename = await this.createMetaForModule({
        module_type,
        source_medias,
        addtl_meta,
      });
      this.$emit("addModules", { meta_filenames: [meta_filename] });
      this.show_module_selector = false;
      return meta_filename;
    },
    async createMultipleModules({ module_type, source_medias = [] }) {
      let meta_filenames = [];
      for (const source_media of source_medias) {
        const media = this.getSourceMedia({
          source_media,
          folder_path: this.publication_path,
        });

        let addtl_meta = {};
        if (["page_by_page", "montage"].includes(this.context))
          if (media?.$infos?.ratio && this.pre_addtl_meta?.width)
            addtl_meta.height = this.pre_addtl_meta.width * media.$infos.ratio;
        if (media?.$location) addtl_meta.location = media.$location;

        const meta_filename = await this.createMetaForModule({
          module_type,
          source_medias: [source_media],
          addtl_meta,
        });
        meta_filenames.push(meta_filename);
      }

      this.show_module_selector = false;
      this.$emit("addModules", { meta_filenames });
    },
    async createMetaForModule({ module_type, source_medias, addtl_meta }) {
      let additional_meta = {
        module_type,
        source_medias,
        requested_slug: "module",
      };

      if (this.pre_addtl_meta)
        Object.assign(additional_meta, this.pre_addtl_meta);
      if (addtl_meta) Object.assign(additional_meta, addtl_meta);
      if (this.post_addtl_meta)
        Object.assign(additional_meta, this.post_addtl_meta);

      const { meta_filename } = await this.$api
        .uploadFile({
          path: this.publication_path,
          additional_meta,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
      return meta_filename;
    },
  },
};
</script>
<style lang="scss" scoped>
._moduleCreator {
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  pointer-events: none;
  gap: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 2) 0;

  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);

  --icon-size: 1.2rem;

  &.is--collapsed {
    padding: 0;
  }

  > * {
    pointer-events: auto;
  }
}

._typePicker {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  gap: calc(var(--spacing) / 4);

  > * {
    // padding: calc(var(--spacing) / 2);
  }
}

._dropNotice {
  pointer-events: none;
}

._showModuleSelector {
  // position: absolute;
  // right: 100%;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

._addBtn {
  margin-left: -24px;
}
</style>
