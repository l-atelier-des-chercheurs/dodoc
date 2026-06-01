<template>
  <div class="_carousel" :class="{}">
    <FlickityCarousel
      :key="slider_key"
      :show_fullscreen_button="true"
      class="_mainCarousel"
    >
      <div
        class="carousel-cell"
        :data-mediatype="media_with_linked._linked_media.$type"
        v-for="(media_with_linked, index) in medias_with_linked"
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
          :show_fs_button="false"
          :display_credits_caption="true"
          :can_edit_credits_caption="can_edit"
        />
        <CaptionCreditsPage
          :media="media_with_linked._linked_media"
          :publication_path="publication_path"
          :can_edit="can_edit"
        />

        <div class="_btnRow" v-if="edit_mode">
          <button
            type="button"
            class="u-button u-button_icon u-button_small"
            @click="show_change_order_modal = true"
          >
            <b-icon icon="arrow-left-right" />
          </button>
          <template v-if="showObjectFitFor(media_with_linked)">
            <button
              type="button"
              class="u-button u-button_icon u-button_small"
              v-if="
                !(
                  !media_with_linked.objectFit ||
                  media_with_linked.objectFit === 'cover'
                )
              "
              @click="
                $emit('updateMediaOpt', {
                  index,
                  opt: { objectFit: 'cover' },
                })
              "
            >
              <b-icon icon="aspect-ratio" />
              <!-- {{ $t("object_fit_cover") }} -->
            </button>
            <button
              type="button"
              class="u-button u-button_icon u-button_small"
              v-if="media_with_linked.objectFit !== 'contain'"
              @click="
                $emit('updateMediaOpt', {
                  index,
                  opt: { objectFit: 'contain' },
                })
              "
            >
              <b-icon icon="aspect-ratio-fill" />
            </button>
          </template>
          <button
            type="button"
            class="u-button u-button_icon"
            @click="$emit('removeMediaAtIndex', { index })"
          >
            <b-icon icon="trash" />
            <!-- v-if="is_multiple_medias" -->
            <!-- {{ $t("remove") }} -->
          </button>
        </div>
      </div>
    </FlickityCarousel>

    <ChangeOrderModal
      v-if="show_change_order_modal"
      :medias_with_linked="medias_with_linked"
      :publication_path="publication_path"
      @pickMedias="$emit('pickMedias', $event)"
      @reorderMedias="$emit('reorderMedias', $event)"
      @removeMediaAtIndex="$emit('removeMediaAtIndex', $event)"
      @close="show_change_order_modal = false"
    />

    <div class="_mediaPickerTile" v-if="can_edit">
      <EditBtn
        :btn_type="'add'"
        :is_unfolded="false"
        @click="show_media_picker = true"
      />
      <MediaPicker
        v-if="show_media_picker"
        :publication_path="publication_path"
        @pickMedias="$emit('pickMedias', $event)"
        @close="show_media_picker = false"
      />
      <DropZone
        class="_dzAfter"
        @mediaDropped="$emit('pickMedias', [$event])"
      />
    </div>
  </div>
</template>
<script>
import FlickityCarousel from "@/adc-core/ui/FlickityCarousel.vue";
import MediaPicker from "@/components/publications/MediaPicker.vue";
import CaptionCreditsPage from "@/components/publications/modules/CaptionCreditsPage.vue";
import ChangeOrderModal from "@/components/publications/modules/ChangeOrderModal.vue";

export default {
  props: {
    medias_with_linked: Array,
    context: String,
    page_template: String,
    show_fs_button: Boolean,
    number_of_max_medias: [Boolean, Number],
    publication_path: String,
    publi_width: Number,
    edit_mode: Boolean,
    can_edit: Boolean,
  },
  components: {
    FlickityCarousel,
    MediaPicker,
    CaptionCreditsPage,
    ChangeOrderModal,
  },
  data() {
    return {
      show_media_picker: false,
      show_change_order_modal: false,
      // navOptions: {
      //   asNavFor: "._mainCarousel",
      //   contain: true,
      // },
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    slider_key() {
      const key = this.medias_with_linked.map(
        (mf, index) => mf.meta_filename_in_project + "-index-" + index
      );
      if (key) return JSON.stringify(key);
      return "none";
    },
  },
  methods: {
    itemStyle({ media_with_linked }) {
      let props = {};
      props["--object-fit"] = media_with_linked.objectFit || "cover";
      return props;
    },
    mediaIsSquare(media) {
      return media.$infos?.ratio === 1;
    },
    showObjectFitFor(media_with_linked) {
      if (!media_with_linked._linked_media) return false;
      if (this.mediaIsSquare(media_with_linked._linked_media)) return false;
      if (
        !["image", "video", "stl", "pdf"].includes(
          media_with_linked._linked_media.$type
        )
      )
        return false;
      return true;
    },
  },
};
</script>
<style lang="scss" scoped>
._mainCarousel {
  position: relative;
  width: 100%;

  ::v-deep ._mediaContent {
    width: 100%;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
    }

    ._mediaContent--image,
    .plyr--video,
    .plyr__poster,
    ._mediaContent--iframe,
    ._iframeStylePreview {
      position: absolute;
      height: 100%;
      width: 100%;
      object-fit: var(--object-fit, cover);
      background-size: var(--object-fit, cover);
      background-color: var(--c-gris_clair);
    }
  }
}

._carousel {
  background: var(--c-gris_clair);
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

  button,
  select {
    // background: white;
    pointer-events: auto;

    border-radius: 4px;
    color: var(--c-noir);
    background: rgb(255 255 255 / 40%);
    backdrop-filter: blur(8px);
    padding: 4px;
    // background: rgba(0, 0, 0, 0.2);
  }
}
._dzAfter {
  z-index: 1000;
}
</style>
