<template>
  <div class="_singleBaseMediaPicker" :data-context="context">
    <div class="_mpContent">
      <MediaContent
        v-if="selected_media"
        :key="selected_media.$path"
        :file="selected_media"
        :resolution="220"
        :context="context"
        @videoPaused="$emit('videoPaused')"
        @videoEnded="$emit('videoEnded')"
      />
      <span v-else-if="content">
        {{ $t("media_not_found") }}
      </span>
      <div class="_changeBtn">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          v-if="!content"
          @click="show_media_picker = true"
        >
          <b-icon icon="image" />
          {{ title }}
        </button>
        <button
          type="button"
          class="u-button u-button_small u-button_red"
          v-else
          @click="show_media_picker = true"
        >
          <b-icon icon="arrow-left-right" />
          <!-- {{ $t("change_base_media") }} -->
          {{ $t("change") }}
        </button>

        <PickMediaFromProjects
          v-if="show_media_picker"
          :title="title"
          :path="path"
          :select_mode="'single'"
          :pick_from_types="[media_type_to_pick]"
          @pickMedias="pickMedia"
          @close="show_media_picker = false"
        />
      </div>

      <DropZone
        :media_types_allowed="
          media_type_to_pick ? [media_type_to_pick] : undefined
        "
        @mediaDropped="pickMedia"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    context: { default: "preview", type: String },
    field_name: String,
    content: {
      type: String,
      default: "",
    },
    open_modal_if_empty: Boolean,
    path: String,
    selected_media_path: String,
    media_type_to_pick: String,
  },
  components: {},
  data() {
    return {
      show_media_picker: !this.content
        ? this.open_modal_if_empty === true
        : false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    selected_media() {
      const meta_filename_in_project = this.content;
      if (meta_filename_in_project)
        return this.getSourceMedia({
          source_media: { meta_filename_in_project },
          folder_path: this.selected_media_path || this.path,
        });
      return false;
    },
  },
  methods: {
    async pickMedia(medias) {
      const media = medias[0];
      const selected_media_filename = this.getFilename(media.$path);
      const new_meta = {
        [this.field_name]: selected_media_filename,
      };
      return await this.$api.updateMeta({
        path: this.path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._singleBaseMediaPicker {
  display: flex;

  > ._mpContent {
    position: relative;

    display: flex;
    flex-flow: row wrap;
    align-items: center;

    margin: 0 auto;
    // width: auto;
    width: 100%;
    max-width: 440px;

    color: white;
    background: var(--c-bleumarine_fonce);
    gap: calc(var(--spacing) / 4);
    padding: calc(var(--spacing) / 4);
    border-radius: 4px;

    ::v-deep ._mediaContent {
      ._mediaContent--image {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        max-width: none;
        border-radius: 1px;
      }
    }
  }

  &[data-context="full"] {
    ::v-deep ._mediaContent {
      width: 440px;
      height: auto;
      aspect-ratio: 1/1;

      ._mediaContent--image {
        object-fit: scale-down;
      }
    }
  }
  &[data-context="preview"] {
    ::v-deep ._mediaContent {
      width: 50px;
      height: 50px;
    }
  }
}

._changeBtn {
  line-height: 1;
  flex: 1 0 auto;
  text-align: center;
}
</style>
