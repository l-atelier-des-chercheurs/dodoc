<template>
  <div
    class="_mediaGrid"
    :class="{
      'is--multipleMedias': is_multiple_medias && !$root.is_mobile_view,
      'is--singleText': is_single_text,
    }"
  >
    <template v-for="(media_with_linked, index) in medias_with_linked">
      <!-- <DropZone
        v-if="
          !number_of_max_medias ||
          medias_with_linked.length < number_of_max_medias
        "
        :key="'dz-' + index"
        class="_dzInbetween"
        @mediaDropped="$emit('pickMedias', $event)"
      /> -->
      <div
        class="_mediaGrid--item"
        :key="itemKey(media_with_linked._linked_media, index)"
        :data-mediatype="media_with_linked._linked_media.$type"
        :style="itemStyle({ media_with_linked })"
      >
        <div
          v-if="!media_with_linked._linked_media"
          class="u-instructions _noSourceMedia"
          v-text="$t('source_media_missing')"
        />
        <CollaborativeEditor3
          v-else-if="media_with_linked._linked_media.$type === 'text'"
          class="_mediaContent--collabEditor"
          :key="edit_mode"
          :content="media_with_linked._linked_media.$content"
          :path="media_with_linked._linked_media.$path"
          :mode="'edit_on_mounted'"
          :can_edit="edit_mode"
        />
        <TableEditor
          v-else-if="media_with_linked._linked_media.$type === 'table'"
          class="_mediaContent--table"
          :content="media_with_linked._linked_media.$content"
          :path="media_with_linked._linked_media.$path"
          :can_edit="edit_mode"
        />
        <MediaContent
          v-else
          :file="media_with_linked._linked_media"
          :resolution="context === 'preview' ? 220 : 1600"
          :context="context"
          :show_fs_button="show_fs_button"
          :can_edit="can_edit"
        />
        <CaptionCreditsPage
          :media="media_with_linked._linked_media"
          :publication_path="publication_path"
          :can_edit="can_edit"
        />

        <div class="_btnRow">
          <DragFile
            v-if="edit_mode && page_template !== 'page_by_page'"
            class="_df"
            :size="'small'"
            :file="media_with_linked._linked_media"
            @dragfileSuccess="mediaDraggedSuccessfully(index)"
          />
          <template v-if="edit_mode">
            <template v-if="showAspectRatioOptions(media_with_linked)">
              <button
                type="button"
                class="u-button u-button_icon u-button_small"
                v-if="
                  !(
                    !media_with_linked.objectFit ||
                    media_with_linked.objectFit === 'cover'
                  )
                "
                @click.stop="
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
                @click.stop="
                  $emit('updateMediaOpt', {
                    index,
                    opt: { objectFit: 'contain' },
                  })
                "
              >
                <!-- v-if="media_with_linked.objectFit !== 'contain'" -->
                <!-- {{ $t("object_fit_contain") }} -->
                <b-icon icon="aspect-ratio-fill" />
              </button>
            </template>
            <button
              type="button"
              class="u-button u-button_icon u-button_small"
              v-if="is_multiple_medias"
              @click="removeMedia(index)"
            >
              <b-icon icon="trash" />
            </button>
          </template>
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
      <EditBtn
        v-if="edit_mode"
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
      <template
        v-if="
          !number_of_max_medias ||
          medias_with_linked.length < number_of_max_medias
        "
      >
        <DropZone
          class="_dzAfter"
          :rotate="-90"
          @mediaDropped="$emit('pickMedias', [$event])"
        />
      </template>
    </div>
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";
import CaptionCreditsPage from "@/components/publications/modules/CaptionCreditsPage.vue";

export default {
  props: {
    medias_with_linked: Array,
    context: String,
    publimodule: Object,
    page_template: String,
    show_fs_button: Boolean,
    number_of_max_medias: [Boolean, Number],
    publication_path: String,
    edit_mode: Boolean,
    can_edit: Boolean,
  },
  components: {
    MediaPicker,
    CaptionCreditsPage,
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
    is_single_text() {
      return (
        this.medias_with_linked.length === 1 &&
        this.medias_with_linked[0]._linked_media.$type === "text"
      );
    },
    is_multiple_medias() {
      return this.medias_with_linked.length > 1;
    },
    single_media_displayed_at_full_ratio() {
      const theoretical_ratio =
        this.medias_with_linked[0]._linked_media.$infos?.ratio;
      const current_ratio =
        this.publimodule?.height && this.publimodule?.width
          ? this.publimodule?.height / this.publimodule?.width
          : false;

      if (!theoretical_ratio || !current_ratio) return false;

      const dec = 10;
      return (
        Math.round(theoretical_ratio * dec) === Math.round(current_ratio * dec)
      );
    },
  },
  methods: {
    itemKey(_lm, index) {
      if (_lm?.$path) return _lm.$path + "_" + index;
      return "no_media_" + index;
      // if (_lm?.$path) return _lm.$path + "_" + _lm.$date_created;
      // return "no_media_" + index;
    },
    itemStyle({ media_with_linked }) {
      let props = {};
      props["--object-fit"] = media_with_linked.objectFit || "cover";

      return props;
    },
    mediaIsSquare(media) {
      return media.$infos?.ratio === 1;
    },
    removeMedia(index) {
      this.$emit("removeMediaAtIndex", { index });
    },
    mediaDraggedSuccessfully(index) {
      console.log("mediaDraggedSuccessfully");
      this.$emit("removeMediaAtIndex", { index, remove_source: false });
      // if
    },
    showAspectRatioOptions(media_with_linked) {
      if (
        this.medias_with_linked.length === 1 &&
        this.page_template !== "page_by_page"
      )
        return false;

      const unsupportedTypes = ["stl", "obj", "text", "table", "other"];
      if (unsupportedTypes.includes(media_with_linked._linked_media.$type))
        return false;

      if (
        this.page_template !== "page_by_page" &&
        this.mediaIsSquare(media_with_linked._linked_media)
      )
        return false;

      if (this.single_media_displayed_at_full_ratio) return false;

      return true;
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaGrid {
  position: relative;
  width: 100%;
  page-break-inside: avoid;
  -webkit-region-break-inside: avoid;

  ::v-deep ._mediaContent .plyr__controls {
    padding-right: calc(var(--spacing) * 3);
    width: 100%;
  }

  &.is--singleText {
    page-break-inside: auto;
  }

  &.is--multipleMedias {
    display: flex;
    flex-flow: row nowrap;
    gap: calc(var(--spacing) / 2);
    transition: flex 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }

  > ._mediaGrid--item {
    position: relative;
    transition: flex 0.25s cubic-bezier(0.19, 1, 0.22, 1);

    ::v-deep ._iframeStylePreview {
      object-fit: var(--object-fit, cover);
    }
  }

  // ._dzInbetween {
  //   position: relative !important;
  //   width: 20px;
  // }

  &.is--multipleMedias > ._mediaGrid--item {
    aspect-ratio: 1/1;
    overflow: hidden;
    // background: var(--c-gris_clair);
    flex: 1 1 calc(100% / var(--number_of_medias));

    &[data-mediatype="text"] {
      aspect-ratio: auto;
    }
    &[data-mediatype="audio"] {
      aspect-ratio: auto;
    }
    &:not([data-mediatype="text"]) {
      // background: var(--c-gris_clair);
    }
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

  ::v-deep {
    button {
      // background: white;
      pointer-events: auto;

      border-radius: 4px;
      color: var(--c-noir);
      background: rgb(255 255 255 / 40%);
      backdrop-filter: blur(8px);
      padding: 4px;
    }
  }
}

._noSourceMedia {
  width: 100%;
  padding: calc(var(--spacing) / 4);
  text-align: center;
}

._dragFileIcon {
  // position: absolute;
  // top: 0;
  // right: 0;
  // z-index: 10;
}
._df {
  display: inline-flex;
}

._dzAfter {
  z-index: 1000;
}

._mediaContent--collabEditor {
  ::v-deep ._editText {
    margin-right: calc(var(--spacing) * 3);
  }
}
</style>
