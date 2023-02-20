<template>
  <div class="_moduleCreator">
    <div v-if="show_module_selector || !is_collapsed" class="_typePicker">
      <button
        type="button"
        class="u-button u-button_bleuvert"
        @click="createText"
      >
        {{ $t("add_text") }}
      </button>
      <button
        type="button"
        class="u-button u-button_bleuvert"
        v-if="!show_media_picker"
        @click="show_media_picker = true"
      >
        {{ $t("add_medias") }}
      </button>
      <MediaPicker
        v-else
        :publication_path="publication_path"
        @selectMedia="createMosaic"
        @close="show_media_picker = false"
      />
    </div>

    <button
      type="button"
      class="u-button _showModuleSelector _sideBtns"
      v-if="is_collapsed"
      :style="show_module_selector ? 'transform: rotate(45deg);' : ''"
      @click="show_module_selector = !show_module_selector"
    >
      <svg
        version="1.1"
        viewBox="0 0 670 670"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        style="fill: currentColor"
      >
        <path
          d="m350 528.89c137.33 0 248.89-111.56 248.89-248.89s-111.56-248.89-248.89-248.89-248.89 111.56-248.89 248.89 111.56 248.89 248.89 248.89zm-161.05-279h130.94v-130.94h60.215v130.94h130.94v60.211h-130.94v130.94h-60.215l0.003906-130.94h-130.94z"
        />
      </svg>
    </button>

    <transition name="dropzone" :duration="150">
      <DropZone v-if="show_dropzone" @mediaDropped="createMosaic" />
    </transition>
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    publication_path: String,
    page_id: String,
    is_collapsed: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    MediaPicker,
  },
  data() {
    return {
      show_module_selector: false,
      show_media_picker: false,

      show_dropzone: false,

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
    async createMosaic({ path_to_source_media }) {
      await this.createModule({
        module_type: "mosaic",
        source_medias: [{ path: path_to_source_media }],
      });
      this.show_media_picker = false;
    },
    async createText() {
      const text_meta_filename = await this.$api.uploadText({
        path: this.publication_path,
        filename: "text.txt",
        content: "",
        additional_meta: {
          caption: "plip",
          module_type: this.module_type,
        },
      });
      const text_meta_path = this.publication_path + "/" + text_meta_filename;
      const source_medias = [{ path: text_meta_path }];

      await this.createModule({
        module_type: "text",
        source_medias,
      });
    },

    async createModule({ module_type, source_medias = [] }) {
      const meta_filename = await this.createMetaForModule({
        module_type,
        source_medias,
      });
      this.$emit("addModule", { meta_filename });
      this.show_module_selector = false;
    },

    async createMetaForModule({ module_type, source_medias }) {
      let additional_meta = {
        module_type,
        source_medias,
        requested_slug: "module",
      };

      if (this.page_id) additional_meta.page_id = this.page_id;

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
  justify-content: flex-start;
  place-content: center;
  align-items: center;
  width: 100%;
  pointer-events: none;
  // padding: 0 calc(var(--spacing) * 1);

  color: var(--c-bleuvert);
  border-radius: 1rem;

  > * {
    pointer-events: auto;
  }
}

._typePicker {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);

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
  position: absolute;
  right: 100%;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

._sideBtns {
  --side-width: 24px;
  display: block;
  width: var(--side-width);
  height: var(--side-width);
  padding: 0;
  border-radius: calc(var(--side-width) / 2);
  background: transparent;
  color: var(--c-noir);

  &:hover,
  &:focus {
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>
