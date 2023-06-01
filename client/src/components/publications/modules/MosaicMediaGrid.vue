<template>
  <div
    class="_mediaGrid"
    :class="{
      'is--multipleMedias': is_multiple_medias,
    }"
  >
    <template v-for="(media_with_linked, index) in medias_with_linked">
      <div
        class="_mediaGrid--item"
        :key="
          (media_with_linked._linked_media &&
            media_with_linked._linked_media.$path) ||
          'no_media_' + index
        "
        :style="itemStyle({ media_with_linked })"
      >
        <span
          v-if="!media_with_linked._linked_media"
          class="_noSourceMedia u-instructions"
          v-text="$t('source_media_missing')"
        />
        <MediaContent
          v-else
          :file="media_with_linked._linked_media"
          :resolution="context === 'preview' ? 220 : 1600"
          :context="context"
          :show_fs_button="show_fs_button"
        />

        <div class="_btnRow" v-if="can_edit">
          <button
            type="button"
            class="u-buttonLink"
            v-if="
              (is_multiple_medias ||
                (page_template === 'page_by_page' &&
                  !single_media_displayed_at_full_ratio)) &&
              !(
                !media_with_linked.objectFit ||
                media_with_linked.objectFit === 'cover'
              )
            "
            @click="
              $emit('updateMediaOpt', { index, opt: { objectFit: 'cover' } })
            "
          >
            {{ $t("object_fit_cover") }}
          </button>
          <button
            type="button"
            class="u-buttonLink"
            v-if="
              (is_multiple_medias ||
                (page_template === 'page_by_page' &&
                  !single_media_displayed_at_full_ratio)) &&
              media_with_linked.objectFit !== 'contain'
            "
            @click="
              $emit('updateMediaOpt', {
                index,
                opt: { objectFit: 'contain' },
              })
            "
          >
            <!-- v-if="media_with_linked.objectFit !== 'contain'" -->
            {{ $t("object_fit_contain") }}
          </button>
          <button
            type="button"
            class="u-buttonLink"
            v-if="is_multiple_medias"
            @click="$emit('removeMediaAtIndex', index)"
          >
            {{ $t("remove") }}
          </button>
        </div>
      </div>
    </template>
    <div
      class="_mediaPickerTile"
      v-if="
        can_edit &&
        (!number_of_max_medias ||
          medias_with_linked.length < number_of_max_medias)
      "
    >
      <button
        type="button"
        class="u-button u-button_transparent u-addBtn"
        @click="show_media_picker = true"
      >
        <sl-icon name="plus-circle" />
      </button>
      <MediaPicker
        v-if="show_media_picker"
        :publication_path="publication_path"
        @addMedias="$emit('addMedias', $event)"
        @close="show_media_picker = false"
      />
      <template
        v-if="
          !number_of_max_medias ||
          medias_with_linked.length < number_of_max_medias
        "
      >
        <DropZone @mediaDropped="$emit('addMedias', $event)" />
      </template>
    </div>
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    medias_with_linked: Array,
    context: String,
    page_template: String,
    show_fs_button: Boolean,
    number_of_max_medias: [Boolean, Number],
    publication_path: String,
    can_edit: Boolean,
  },
  components: {
    MediaPicker,
  },
  data() {
    return {
      show_media_picker: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    is_multiple_medias() {
      return this.medias_with_linked.length > 1;
    },
    single_media_displayed_at_full_ratio() {
      if (this.medias_with_linked.length > 1) return false;

      const theoretical_ratio =
        this.medias_with_linked[0]._linked_media.$infos?.ratio;
      const current_ratio =
        this.publimodule?.height && this.publimodule?.width
          ? Math.round(
              (this.publimodule?.height / this.publimodule?.width) * 10
            )
          : false;
      if (!theoretical_ratio || !current_ratio) return false;

      return Math.round(theoretical_ratio * 10) === current_ratio;
    },
  },
  methods: {
    itemStyle({ media_with_linked }) {
      let props = {};
      props["--object-fit"] = media_with_linked.objectFit || "cover";
      return props;
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaGrid {
  position: relative;
  width: 100%;

  &.is--multipleMedias {
    display: flex;
    flex-flow: row nowrap;
    gap: calc(var(--spacing) / 4);
    transition: flex 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }

  > ._mediaGrid--item {
    position: relative;
    transition: flex 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }

  &.is--multipleMedias > ._mediaGrid--item {
    aspect-ratio: 1/1;
    overflow: hidden;
    background: var(--c-gris_clair);
    flex: 1 1 calc(100% / var(--number_of_medias));
  }

  &.is--multipleMedias ::v-deep ._mediaContent {
    width: 100%;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
    }

    ._mediaContent--image,
    .plyr--video,
    ._mediaContent--iframe {
      position: absolute;
      height: 100%;
      width: 100%;
      object-fit: var(--object-fit, cover);
    }
  }
}

._mediaPickerTile {
  position: absolute;
  top: 0;
  left: 100%;
  // background: var(--c-gris);
  // height: 100%;
  display: flex;
  place-content: center;
  height: 100%;
  align-items: center;

  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

._btnRow {
  position: absolute;
  padding: calc(var(--spacing) / 2);
  top: 0;
  right: 0;
  left: auto;
  z-index: 100;

  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);

  pointer-events: none;

  button {
    // background: white;
    pointer-events: auto;

    border-radius: 4px;
    color: white;
    background: var(--c-noir);
    padding: 2px;
    // background: rgba(0, 0, 0, 0.2);
  }
}
</style>
