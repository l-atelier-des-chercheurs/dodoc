<template>
  <div
    class="_moduleCreator"
    :class="{
      'is--highlighted': is_highlighted,
      'is--dragover': is_dragover,
    }"
    @dragover="onDragover"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div v-if="show_module_selector && !is_highlighted" class="_typePicker">
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

    <span v-if="is_highlighted" class="u-button u-button_bleuvert _dropNotice">
      {{ $t("drop_here") }}
    </span>
    <sl-icon-button
      v-else-if="!show_module_selector"
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

      is_highlighted: false,
      is_dragover: false,

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
    this.$eventHub.$on(`mediadrag.start`, this.highlightZone);
    this.$eventHub.$on(`mediadrag.end`, this.unhighlightZone);
  },
  beforeDestroy() {
    this.$eventHub.$off(`mediadrag.start`, this.highlightZone);
    this.$eventHub.$off(`mediadrag.end`, this.unhighlightZone);
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
      this.is_saving = true;

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

      this.is_saving = false;
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

    highlightZone() {
      this.is_highlighted = true;
    },
    unhighlightZone() {
      this.is_highlighted = false;
      this.is_dragover = false;
    },
    onDragover($event) {
      $event.preventDefault();
    },
    onDragEnter($event) {
      $event.preventDefault();
      this.is_dragover = true;
    },
    onDragLeave($event) {
      $event.preventDefault();
      this.is_dragover = false;
    },
    async onDrop($event) {
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "link";

      if (!$event.dataTransfer.getData("text/plain")) return false;

      const file = JSON.parse($event.dataTransfer.getData("text/plain"));
      const path_to_source_media = file.$path;

      await this.createMosaic({ path_to_source_media });
    },
  },
};
</script>
<style lang="scss" scoped>
._moduleCreator {
  display: flex;
  place-content: center;
  align-items: center;
  width: 100%;

  // color: var(--c-bleuvert_clair);
  border-radius: 1rem;

  --color-1: white;
  --color-2: white;

  background: radial-gradient(
      circle,
      transparent 20%,
      var(--color-1) 20%,
      var(--color-1) 80%,
      transparent 80%,
      transparent
    ),
    radial-gradient(
        circle,
        transparent 20%,
        var(--color-1) 20%,
        var(--color-1) 80%,
        transparent 80%,
        transparent
      )
      15px 15px,
    linear-gradient(
        var(--color-2) 1.2000000000000002px,
        transparent 1.2000000000000002px
      )
      0 -0.6000000000000001px,
    linear-gradient(
        90deg,
        var(--color-2) 1.2000000000000002px,
        var(--color-1) 1.2000000000000002px
      ) -0.6000000000000001px 0;
  background-size: 30px 30px, 30px 30px, 15px 15px, 15px 15px;

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--highlighted {
    // background: var(--c-bleuvert_clair);
    --color-2: var(--c-bleuvert);
  }
  &.is--dragover {
    // background: var(--c-bleuvert);
    background: var(--c-bleuvert);
    --color-2: white;
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
</style>
