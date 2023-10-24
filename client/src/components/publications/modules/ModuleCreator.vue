<template>
  <div
    class="_moduleCreator"
    :class="{
      'is--collapsed': !show_module_selector,
    }"
  >
    <transition name="scaleInFade" mode="out-in">
      <div v-if="show_module_selector || !start_collapsed" class="_typePicker">
        <button
          type="button"
          class="u-button u-button_bleumarine"
          v-if="types_available.includes('text')"
          @click="createText"
        >
          <template v-if="show_labels">{{ $t("text") }}</template>
          <sl-icon
            name="fonts"
            style="font-size: var(--icon-size)"
            :label="$t('add_text')"
          />
        </button>

        <button
          type="button"
          class="u-button u-button_bleumarine"
          v-if="types_available.includes('medias')"
          @click="show_media_picker = true"
        >
          <template v-if="show_labels">{{ $t("medias") }}</template>
          <sl-icon
            name="image"
            style="font-size: var(--icon-size)"
            :label="$t('add_medias')"
          />
        </button>
        <MediaPicker
          v-if="show_media_picker"
          :publication_path="publication_path"
          :select_mode="select_mode"
          @addMedias="createMosaic"
          @close="show_media_picker = false"
        />

        <button
          type="button"
          class="u-button u-button_bleumarine"
          v-if="types_available.includes('files')"
          @click="show_file_picker = true"
        >
          <template v-if="show_labels">{{ $t("files") }}</template>
          <sl-icon
            name="file-earmark-binary-fill"
            style="font-size: var(--icon-size)"
            :label="$t('add_files')"
          />
        </button>
        <MediaPicker
          v-if="show_file_picker"
          :publication_path="publication_path"
          :select_mode="select_mode"
          @addMedias="createFiles"
          @close="show_file_picker = false"
        />

        <button
          type="button"
          class="u-button u-button_bleumarine"
          v-if="types_available.includes('link')"
          @click="show_link_picker = true"
        >
          <template v-if="show_labels">{{ $t("link") }}</template>
          <sl-icon
            name="link"
            style="font-size: var(--icon-size)"
            :label="$t('add_link')"
          />
        </button>
        <LinkPicker
          v-if="show_link_picker"
          @embed="createEmbed"
          @close="show_link_picker = false"
        />

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
            <template v-if="show_labels">{{ $t(shape.type) }}</template>
            <sl-icon
              :name="shape.icon"
              style="font-size: var(--icon-size)"
              :label="$t(shape.type)"
            />
            <!-- {{ $t("add_medias") }} -->
          </button>
        </template>
      </div>
    </transition>

    <template v-if="start_collapsed">
      <EditBtn
        key="addmodule"
        :btn_type="!show_module_selector ? 'add' : 'close'"
        class="_addBtn"
        @click="show_module_selector = !show_module_selector"
      />
    </template>
    <!-- <button
      type="button"
      class="u-button u-button_transparent u-addBtn"
      v-if="start_collapsed"
      :style="show_module_selector ? 'transform: rotate(45deg);' : ''"
      @click="show_module_selector = !show_module_selector"
    >
      <b-icon icon="plus-circle-fill" />
    </button> -->

    <DropZone @mediaDropped="createMosaic" />
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";
import LinkPicker from "@/adc-core/modals/LinkPicker.vue";

export default {
  props: {
    publication_path: String,
    pre_addtl_meta: Object,
    post_addtl_meta: Object,
    select_mode: String,
    show_labels: {
      type: Boolean,
      default: true,
    },
    context: String,
    types_available: {
      type: Array,
      default: () => ["text", "medias", "files", "link", "shapes"],
    },
    start_collapsed: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    MediaPicker,
    LinkPicker,
  },
  data() {
    return {
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
  watch: {},
  computed: {},
  methods: {
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
        path_to_source_media_metas.map((path_to_source_media_meta) => {
          const meta_filename_in_project = this.getFilename(
            path_to_source_media_meta
          );
          source_medias.push({
            meta_filename_in_project,
          });
        });
      }
      if (this.context === "page_by_page") {
        source_medias = source_medias.map((sm) => {
          sm.objectFit = "contain";
          return sm;
        });
      }

      if (this.context === "page_by_page") {
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

      const text_meta_filename = await this.$api.uploadText({
        path: this.publication_path,
        filename,
        content: full_url,
        additional_meta: {
          module_type: this.module_type,
          $type: "url",
        },
      });
      this.createMosaic({ meta_filename: text_meta_filename });
      this.show_link_picker = false;
    },
    async createFiles({ path_to_source_media_metas }) {
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
      const meta_filename = await this.$api.uploadText({
        path: this.publication_path,
        filename,
        content: "",
        additional_meta: {
          module_type: this.module_type,
        },
      });
      const source_medias = [{ meta_filename }];
      await this.createModule({
        module_type: "text",
        source_medias,
      });
    },

    async createModule({ module_type, source_medias = [], addtl_meta = {} }) {
      // get infos from first media
      if (source_medias.length > 0) {
        const media = this.getSourceMedia({
          source_media: source_medias[0],
          folder_path: this.publication_path,
        });
        if (media?.$infos?.gps) addtl_meta.location = media.$infos.gps;
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
        if (this.context === "page_by_page")
          if (media?.$infos?.ratio)
            addtl_meta.height =
              this.$root.default_new_module_width * media.$infos.ratio;

        if (media?.$infos?.gps) addtl_meta.location = media.$infos.gps;

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

      return await this.$api
        .uploadFile({
          path: this.publication_path,
          additional_meta,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
._moduleCreator {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  pointer-events: none;
  gap: calc(var(--spacing) / 4); // padding: 0 calc(var(--spacing) * 1);

  color: var(--c-bleuvert);
  border-radius: 1rem;

  --icon-size: 1.2rem;

  > * {
    pointer-events: auto;
  }
}

._typePicker {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: calc(var(--spacing) / 4);

  > * {
    // padding: calc(var(--spacing) / 2);
    // background: var(--c-gris_clair);
  }
}

._dropNotice {
  pointer-events: none;
}

sl-icon-button::part(base) {
  font-size: 1.5em;
  color: var(--c-bleuvert);
}

._showModuleSelector {
  // position: absolute;
  // right: 100%;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.u-addBtn {
  color: var(--c-noir);
}
</style>
