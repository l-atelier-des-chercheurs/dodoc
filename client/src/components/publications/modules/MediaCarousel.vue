<template>
  <div class="_carousel" :class="{}">
    <transition name="fade" mode="out-in">
      <flickity
        ref="flickity"
        class="_mainCarousel"
        :options="flickityOptions"
        :key="slider_key"
      >
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
          <div class="_btnRow" v-if="can_edit">
            <button
              type="button"
              class="u-buttonLink"
              v-if="
                !(
                  !media_with_linked.objectFit ||
                  media_with_linked.objectFit === 'cover'
                ) && !mediaIsSquare(media_with_linked._linked_media)
              "
              @click="
                $emit('updateMediaOpt', {
                  index,
                  opt: { objectFit: 'cover' },
                })
              "
            >
              <sl-icon name="aspect-ratio" />
              <!-- {{ $t("object_fit_cover") }} -->
            </button>
            <button
              type="button"
              class="u-buttonLink"
              v-if="
                media_with_linked.objectFit !== 'contain' &&
                !mediaIsSquare(media_with_linked._linked_media)
              "
              @click="
                $emit('updateMediaOpt', {
                  index,
                  opt: { objectFit: 'contain' },
                })
              "
            >
              <!-- v-if="media_with_linked.objectFit !== 'contain'" -->
              <!-- {{ $t("object_fit_contain") }} -->
              <sl-icon name="aspect-ratio-fill" />
            </button>
            <button
              type="button"
              class="u-buttonLink"
              @click="$emit('removeMediaAtIndex', index)"
            >
              <sl-icon name="trash3" />
              <!-- v-if="is_multiple_medias" -->
              <!-- {{ $t("remove") }} -->
            </button>
          </div>
        </div>
      </flickity>
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
    </transition>

    <div class="_mediaPickerTile" v-if="can_edit">
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
      <DropZone @mediaDropped="$emit('addMedias', $event)" />
    </div>
  </div>
</template>
<script>
import Flickity from "vue-flickity";
// import "flickity-as-nav-for";
import "flickity-imagesloaded";

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
    Flickity,
    MediaPicker,
  },
  data() {
    return {
      show_media_picker: false,

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
    setTimeout(() => {
      // if (this.$refs.flickity) this.$refs.flickity.resize();
      // if (this.$refs.nav) this.$refs.nav.resize();
    });
  },
  beforeDestroy() {},
  watch: {
    // medias_with_linked() {
    // if (this.$refs.flickity) this.$refs.flickity.reloadCells();
    // },
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
    itemStyle({ media_with_linked }) {
      let props = {};
      props["--object-fit"] = media_with_linked.objectFit || "cover";
      return props;
    },
    mediaIsSquare(media) {
      return media.$infos?.ratio === 1;
    },
  },
};
</script>
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
    ._mediaContent--iframe {
      position: absolute;
      height: 100%;
      width: 100%;
      object-fit: var(--object-fit, cover);
    }
  }
}

._carousel {
  background: var(--c-gris);
  // padding: calc(var(--spacing) / 4);
}

._mainCarousel {
  // padding: calc(var(--spacing) / 4);
  .carousel-cell {
    width: 100%;
    aspect-ratio: 16/9;
    margin-right: calc(var(--spacing) * 1);
  }

  ::v-deep .flickity-page-dots {
    bottom: 0;

    .dot {
      background: var(--c-gris);
      border: none;
      opacity: 1;
      padding: calc(var(--spacing) / 4);
      border: 2px solid transparent;

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

  button {
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
</style>
