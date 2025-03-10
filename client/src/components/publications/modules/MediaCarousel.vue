<template>
  <div class="_carousel" :class="{}">
    <div ref="flickity" class="_mainCarousel" :key="slider_key">
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
          :show_fs_button="show_fs_button"
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
            class="u-buttonLink"
            @click="$emit('removeMediaAtIndex', { index })"
          >
            <b-icon icon="trash" />
            <!-- v-if="is_multiple_medias" -->
            <!-- {{ $t("remove") }} -->
          </button>
        </div>
      </div>
    </div>
    <!-- <flickity ref="nav" class="_navCarousel" :options="navOptions">
      <div
        class="carousel-cell"
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
          :show_fs_button="show_fs_button"
        />
      </div>
    </flickity> -->

    <ChangeOrderModal
      v-if="show_change_order_modal"
      :medias_with_linked="medias_with_linked"
      :publication_path="publication_path"
      @addMedias="$emit('addMedias', $event)"
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
        @addMedias="$emit('addMedias', $event)"
        @close="show_media_picker = false"
      />
      <DropZone class="_dzAfter" @mediaDropped="$emit('addMedias', $event)" />
    </div>
  </div>
</template>
<script>
// import Flickity from "vue-flickity";
// import "flickity-as-nav-for";
import Flickity from "flickity";
import "flickity-imagesloaded";

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
    Flickity,
    MediaPicker,
    CaptionCreditsPage,
    ChangeOrderModal,
  },
  data() {
    return {
      show_media_picker: false,
      observer: null,
      show_change_order_modal: false,

      flickity: null,
      flickityOptions: {
        initialIndex: 0,
        groupCells: false,
        imagesLoaded: true,
        pageDots: true,
        selectedAttraction: 0.2,
        percentPosition: false,
        friction: 0.8,
        cellAlign: "left",
        contain: true,
      },
      // navOptions: {
      //   asNavFor: "._mainCarousel",
      //   contain: true,
      // },
    };
  },
  created() {},
  mounted() {
    this.initFlickity();

    let debounce_resize = undefined;
    this.observer = new ResizeObserver(() => {
      if (debounce_resize) clearTimeout(debounce_resize);
      debounce_resize = setTimeout(async () => {
        this.flkyResize();
      }, 1000);
    });
    this.observer.observe(this.$el);
  },
  beforeDestroy() {
    this.observer.disconnect();
  },
  watch: {
    // medias_with_linked() {
    // if (this.$refs.flickity) this.$refs.flickity.reloadCells();
    // },
    publi_width() {
      setTimeout(() => {
        this.flkyResize();
      }, 250);
    },
    slider_key() {
      this.$nextTick(() => {
        this.initFlickity();
      });
    },
  },
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
    initFlickity() {
      if (this.$refs.flickity)
        this.flickity = new Flickity(this.$refs.flickity, this.flickityOptions);
    },
    flkyResize() {
      if (this.flickity?.resize) this.flickity.resize();
    },
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
<style src="@/../node_modules/flickity/dist/flickity.min.css"></style>
<style lang="scss" scoped>
._mainCarousel,
._navCarousel {
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
    }
  }
}

._carousel {
  background: var(--c-gris_clair);
  page-break-inside: avoid;
  -webkit-region-break-inside: avoid;

  // padding: calc(var(--spacing) / 4);
}

._mainCarousel {
  // padding: calc(var(--spacing) / 4);
  .carousel-cell {
    width: 100%;
    aspect-ratio: 3/2;
    margin-right: calc(var(--spacing) * 1);

    &[data-mediatype="text"] {
      padding: min(calc(var(--spacing) * 3), 15%);
    }
  }

  ::v-deep .flickity-prev-next-button {
    // top: auto;
    // bottom: calc(var(--spacing) * 1);

    &.flickity-prev-next-button.previous {
      left: calc(var(--spacing) / 2);
    }
    &.flickity-prev-next-button.next {
      right: calc(var(--spacing) / 2);
    }
  }
  ::v-deep ._mediaContent .plyr__controls {
    padding-right: calc(var(--spacing) * 3);
  }

  ::v-deep .flickity-page-dots {
    bottom: 0;
    display: flex;
    justify-content: center;
    flex-flow: row nowrap;
    gap: calc(var(--spacing) / 3);
    padding: calc(var(--spacing) / 2);
    pointer-events: none;

    .dot {
      background: rgba(255, 255, 255, 0.5);
      border: none;
      opacity: 1;
      margin: 0;
      padding: calc(var(--spacing) / 4);
      border: 2px solid transparent;
      pointer-events: auto;

      transition: all 0.1s cubic-bezier(0.19, 1, 0.22, 1);

      &:hover,
      &:active,
      &:focus-visible {
        border-color: var(--active-color);
      }

      &.is-selected {
        background: var(--active-color);
        border-color: var(--active-color);
      }
    }
  }
}
._navCarousel {
  margin-top: calc(var(--spacing) / 2);

  .carousel-cell {
    width: 160px;
    height: 90px;
    margin-right: calc(var(--spacing) / 2);
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
