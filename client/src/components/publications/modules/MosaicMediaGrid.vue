<template>
  <div
    ref="gridEl"
    class="_mediaGrid"
    :class="{
      'is--multipleMedias': is_multiple_medias && !$root.is_mobile_view,
      'is--singleText': is_single_text,
      'is--hasSplitters': show_splitters,
    }"
  >
    <template v-for="(media_with_linked, index) in medias_with_linked">
      <div
        class="_mediaGrid--item"
        :key="itemKey(media_with_linked._linked_media, index)"
        :data-mediatype="media_with_linked._linked_media.$type"
        :style="itemStyle({ media_with_linked, index })"
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
          :table_file="media_with_linked._linked_media"
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
                :title="
                  media_with_linked.objectFit === 'contain'
                    ? $t('object_fit_contain')
                    : $t('object_fit_cover')
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
      <div
        v-if="show_splitters && index < medias_with_linked.length - 1"
        :key="'splitter-' + index"
        class="_mediaGrid--splitter"
        role="slider"
        aria-valuemin="0"
        aria-valuemax="100"
        tabindex="0"
        @mousedown.prevent="startSplitterDrag(index, $event)"
        @touchstart.prevent="startSplitterDrag(index, $event)"
      >
        <b-icon icon="grip-vertical" class="_splitterIcon" />
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
      local_width_fractions: [],
      drag_state: null,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    this.unbindSplitterListeners();
  },
  watch: {},
  computed: {
    show_splitters() {
      return (
        this.is_multiple_medias && !this.$root.is_mobile_view && this.edit_mode
      );
    },
    effective_width_fractions() {
      const n = this.medias_with_linked.length;
      if (!n) return [];
      if (
        this.local_width_fractions.length === n &&
        Math.abs(this.local_width_fractions.reduce((a, b) => a + b, 0) - 1) <
          1e-6
      ) {
        return this.local_width_fractions.slice();
      }
      const from_source = this.medias_with_linked.map((m) =>
        typeof m.width_fraction === "number" && m.width_fraction > 0
          ? m.width_fraction
          : null
      );
      const sum = from_source.reduce((a, b) => a + (b ?? 0), 0);
      if (from_source.every((f) => f != null) && Math.abs(sum - 1) < 1e-6) {
        return from_source;
      }
      return this.equalWidthFractions(n);
    },
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
    itemStyle({ media_with_linked, index }) {
      const props = {};
      props["--object-fit"] = media_with_linked.objectFit || "cover";
      if (this.effective_width_fractions[index] != null) {
        props["--item-fraction"] = this.effective_width_fractions[index];
      }
      return props;
    },
    equalWidthFractions(n) {
      return Array.from({ length: n }, () => 1 / n);
    },
    roundWidthFractionsTo3Decimals(fractions) {
      const rounded = fractions.map((f) => Math.round(f * 1000) / 1000);
      const sum = rounded.reduce((a, b) => a + b, 0);
      if (sum === 0) return rounded;
      return rounded.map((f) => Math.round((f / sum) * 1000) / 1000);
    },
    enforceMinInGroupAndSum(group_fractions, target_sum, min_fraction = 0.1) {
      const clamped = group_fractions.map((f) => Math.max(f, min_fraction));
      const sum = clamped.reduce((a, b) => a + b, 0);
      if (sum <= target_sum) return clamped;
      const excess = sum - target_sum;
      const reducible = clamped
        .map((f) => Math.max(0, f - min_fraction))
        .reduce((a, b) => a + b, 0);
      if (reducible < 1e-9) return clamped;
      const scale = 1 - excess / reducible;
      return clamped.map((f) =>
        f <= min_fraction
          ? min_fraction
          : min_fraction + (f - min_fraction) * scale
      );
    },
    startSplitterDrag(splitter_index, e) {
      if (this.drag_state) return;
      const client_x = e.touches ? e.touches[0].clientX : e.clientX;
      this.local_width_fractions = this.effective_width_fractions.slice();
      this.drag_state = {
        splitter_index,
        start_x: client_x,
        start_fractions: this.local_width_fractions.slice(),
      };
      this.bindSplitterListeners();
    },
    bindSplitterListeners() {
      document.addEventListener("mousemove", this.onSplitterMove);
      document.addEventListener("mouseup", this.endSplitterDrag);
      document.addEventListener("touchmove", this.onSplitterMove, {
        passive: false,
      });
      document.addEventListener("touchend", this.endSplitterDrag);
    },
    unbindSplitterListeners() {
      document.removeEventListener("mousemove", this.onSplitterMove);
      document.removeEventListener("mouseup", this.endSplitterDrag);
      document.removeEventListener("touchmove", this.onSplitterMove);
      document.removeEventListener("touchend", this.endSplitterDrag);
    },
    onSplitterMove(e) {
      if (!this.drag_state || !this.$refs.gridEl) return;
      const client_x = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = this.$refs.gridEl.getBoundingClientRect();
      const x = (client_x - rect.left) / rect.width;
      const k = this.drag_state.splitter_index;
      const n = this.medias_with_linked.length;
      const start_f = this.drag_state.start_fractions;
      const left_sum = start_f.slice(0, k + 1).reduce((a, b) => a + b, 0);
      const right_sum = start_f.slice(k + 1).reduce((a, b) => a + b, 0);
      const min_media_fraction = 0.1;
      const min_left = (k + 1) * min_media_fraction;
      const max_left = 1 - (n - k - 1) * min_media_fraction;
      const new_left = Math.max(min_left, Math.min(max_left, x));
      const new_right = 1 - new_left;
      if (left_sum <= 0 || right_sum <= 0) return;
      const left_scale = new_left / left_sum;
      const right_scale = new_right / right_sum;
      const left_scaled = start_f.slice(0, k + 1).map((f) => f * left_scale);
      const right_scaled = start_f.slice(k + 1).map((f) => f * right_scale);
      const left_rebalanced = this.enforceMinInGroupAndSum(
        left_scaled,
        new_left,
        min_media_fraction
      );
      const right_rebalanced = this.enforceMinInGroupAndSum(
        right_scaled,
        new_right,
        min_media_fraction
      );
      const next = [...left_rebalanced, ...right_rebalanced];
      this.local_width_fractions = next;
    },
    endSplitterDrag() {
      if (!this.drag_state) return;
      this.unbindSplitterListeners();
      this.$emit(
        "updateWidthFractions",
        this.roundWidthFractionsTo3Decimals(this.local_width_fractions)
      );
      this.drag_state = null;
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

    &.is--hasSplitters {
      gap: 0;
    }
  }

  > ._mediaGrid--item {
    position: relative;
    transition: flex 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    min-width: 0;

    ::v-deep ._iframeStylePreview {
      object-fit: var(--object-fit, cover);
    }
  }

  &.is--multipleMedias > ._mediaGrid--item {
    aspect-ratio: 1/1;
    overflow: hidden;
    // flex: 1 1 calc(100% / var(--number_of_medias));
    flex: 1 1 calc(var(--item-fraction, 1) * 100%);

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

  &.is--multipleMedias.is--hasSplitters > ._mediaGrid--item {
    // flex: var(--item-fraction, 1) 1 0;
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

._mediaGrid--splitter {
  flex: 0 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: col-resize;
  color: var(--c-noir, #111);
  background: rgb(255 255 255 / 30%);
  backdrop-filter: blur(4px);
  border-radius: 2px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  z-index: 50;
  transition: background 0.15s;

  &:hover,
  &:focus {
    background: rgb(255 255 255 / 50%);
    outline: none;
  }

  ._splitterIcon {
    font-size: 0.75rem;
    opacity: 0.8;
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

._widthFractions {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px;
  border-radius: 4px;
}
</style>
