<template>
  <div class="_moduleCreator">
    <div v-if="show_module_selector" class="_typePicker">
      <!-- <div class="">
        <DLabel :str="$t('add_media')" />
        <MediaPicker
          :publication_path="publication_path"
          @selectMedia="selectMedia"
        />
      </div> -->
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
    <sl-icon-button
      v-if="!show_module_selector"
      name="plus-circle-fill"
      :label="$t('add')"
      @click="show_module_selector = true"
    />

    <sl-icon-button
      v-else
      name="x-circle-fill"
      :label="$t('close')"
      @click="show_module_selector = false"
    />

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
      return await this.$api
        .uploadFile({
          path: this.publication_path,
          additional_meta: {
            module_type,
            source_medias,
            requested_slug: "module",
          },
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
  place-content: center;
  align-items: center;
  width: 100%;

  color: var(--c-bleuvert);
  border-radius: 1rem;
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
</style>
