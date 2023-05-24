<template>
  <div class="_moduleCreator">
    <div v-if="show_module_selector || !is_collapsed" class="_typePicker">
      <button
        type="button"
        class="u-button u-button_bleumarine"
        @click="createText"
      >
        <!-- {{ $t("add_text") }} -->
        <sl-icon
          name="fonts"
          style="font-size: var(--icon-size)"
          :label="$t('add_text')"
        />
      </button>
      <button
        type="button"
        class="u-button u-button_bleumarine"
        @click="show_media_picker = true"
      >
        <sl-icon
          name="image"
          style="font-size: var(--icon-size)"
          :label="$t('add_medias')"
        />
      </button>
      <MediaPicker
        v-if="show_media_picker"
        :publication_path="publication_path"
        :meta_filenames_already_present="meta_filenames_already_present"
        @selectMedia="createMosaic"
        @close="show_media_picker = false"
      />
      <button
        type="button"
        class="u-button u-button_bleumarine"
        @click="show_link_picker = true"
      >
        <sl-icon
          name="link"
          style="font-size: var(--icon-size)"
          :label="$t('add_link')"
        />
      </button>
      <LinkPicker
        v-if="show_link_picker"
        :publication_path="publication_path"
        @selectMedia="createMosaic"
        @embed="createEmbed"
        @close="show_link_picker = false"
      />
      <template v-if="show_shapes === true">
        <button
          type="button"
          v-for="shape in shapes"
          :key="shape.type"
          class="u-button u-button_bleumarine"
          @click="
            createModule({
              module_type: shape.type,
              addtl_meta: shape.addtl_meta,
            })
          "
        >
          <sl-icon
            :name="shape.icon"
            style="font-size: var(--icon-size)"
            :label="$t(shape.type)"
          />
          <!-- {{ $t("add_medias") }} -->
        </button>
      </template>
    </div>

    <button
      type="button"
      class="u-button _showModuleSelector _sideBtns"
      v-if="is_collapsed"
      :style="show_module_selector ? 'transform: rotate(45deg);' : ''"
      @click="show_module_selector = !show_module_selector"
    >
      <sl-icon name="plus-circle" />
    </button>

    <transition name="dropzone" :duration="150">
      <DropZone v-if="show_dropzone" @mediaDropped="createMosaic" />
    </transition>
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";
import LinkPicker from "@/components/publications/LinkPicker.vue";

export default {
  props: {
    publication_path: String,
    meta_filenames_already_present: Array,
    addtl_meta: Object,
    context: String,
    show_shapes: Boolean,
    is_collapsed: {
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
      show_link_picker: false,

      show_dropzone: false,

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
  mounted() {
    this.$eventHub.$on(`mediadrag.start`, this.showDropzone);
    this.$eventHub.$on(`mediadrag.end`, this.hideDropzone);
  },
  beforeDestroy() {
    this.$eventHub.$off(`mediadrag.start`, this.showDropzone);
    this.$eventHub.$off(`mediadrag.end`, this.hideDropzone);
  },
  watch: {},
  computed: {},
  methods: {
    async createMosaic({ meta_filename, path_to_source_media_meta }) {
      // if meta_filename, file is stored in publication
      // if path_to_source_media, we get metafilename
      let source_media = {};

      if (meta_filename) {
        source_media.meta_filename = meta_filename;
      } else if (path_to_source_media_meta) {
        source_media.meta_filename_in_project = this.getFilename(
          path_to_source_media_meta
        );
      }
      if (this.context === "page_by_page") source_media.objectFit = "contain";

      let addtl_meta = {};
      if (this.context === "page_by_page") {
        const media = this.getSourceMedia({
          source_media,
          folder_path: this.publication_path,
        });
        if (media?.$infos?.ratio)
          addtl_meta.height =
            this.$root.default_new_module_width * media.$infos.ratio;
      }

      await this.createModule({
        module_type: "mosaic",
        source_medias: [source_media],
        addtl_meta,
      });
      this.show_media_picker = false;
    },
    async createEmbed(full_url) {
      const text_meta_filename = await this.$api.uploadText({
        path: this.publication_path,
        filename: "url.txt",
        content: full_url,
        additional_meta: {
          module_type: this.module_type,
          $type: "url",
        },
      });

      this.createMosaic({ meta_filename: text_meta_filename });
    },
    async createText() {
      const meta_filename = await this.$api.uploadText({
        path: this.publication_path,
        filename: "text.txt",
        content: "",
        additional_meta: {
          caption: "plip",
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
      const meta_filename = await this.createMetaForModule({
        module_type,
        source_medias,
        addtl_meta,
      });
      this.$emit("addModule", { meta_filename });
      this.show_module_selector = false;
    },

    async createMetaForModule({ module_type, source_medias, addtl_meta }) {
      let additional_meta = {
        module_type,
        source_medias,
        requested_slug: "module",
      };

      if (this.addtl_meta)
        Object.assign(additional_meta, this.addtl_meta, addtl_meta);

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

    showDropzone() {
      this.show_dropzone = true;
    },
    hideDropzone() {
      this.show_dropzone = false;
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
  // padding: 0 calc(var(--spacing) * 1);

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
  justify-content: flex-start;
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

._sideBtns {
  --side-width: 24px;
  display: block;
  // width: var(--side-width);
  // height: var(--side-width);
  padding: calc(var(--spacing) / 2);
  border-radius: calc(var(--side-width) / 2);
  background: transparent;
  font-size: 1.4em;

  color: var(--c-noir);

  display: flex;

  &:hover,
  &:focus {
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>