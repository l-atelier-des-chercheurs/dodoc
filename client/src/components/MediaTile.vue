<template>
  <div
    class="_mediaTile"
    :class="{
      'was--focused': was_focused,
      'is--dragged': is_dragged,
      'is--selected': is_selected,
    }"
    :data-tilemode="tile_mode"
    draggable="true"
    @dragstart="startMediaDrag($event)"
    @dragend="endMediaDrag()"
  >
    <div
      class="u-nut _index"
      :style="`--o-color: var(--color-${file.$origin})`"
      v-html="index"
      @click="$emit('toggleMediaFocus')"
    />
    <MediaContent
      class="_content"
      :file="file"
      :resolution="media_resolution"
    />
    <div
      v-if="tile_mode === 'table'"
      v-html="formatDateToPrecise(file.$date_uploaded)"
    />
    <b-icon
      class="_hasCoordinates"
      v-if="has_coordinates"
      icon="pin-map-fill"
    />
    <span v-if="duration" class="_fileType" v-html="duration" />
    <span
      v-if="['pdf', 'stl'].includes(file.$type) || tile_mode === 'table'"
      class="_fileType"
      v-html="$t(file.$type)"
    />
    <span
      v-if="tile_mode !== 'tiny'"
      class="_caption"
      v-html="file.caption || '–'"
    />
    <div v-if="is_already_selected" class="_alreadySelected">
      <div :style="`--notice-bg: ${is_already_selected.color}`">
        <span>{{ is_already_selected.label }}</span>
      </div>
      <!-- <div v-if="is_already_selected.current" class="_currentPage">
        <span>{{ $t("on_this_page") }}</span>
      </div>
      <div v-if="is_already_selected.other" class="_otherPage">
        <span>{{ $t("on_other_pages") }}</span>
      </div> -->
    </div>

    <button
      type="button"
      class="_focusMediaBtn"
      @click="$emit('toggleMediaFocus')"
    />

    <ToggleInput
      v-if="is_selectable"
      class="_selectCb"
      :content="is_selected"
      @update:content="$emit('setSelected', $event)"
    />

    <!-- <input
      v-if="is_selectable"
      class="_selectCb"
      type="checkbox"
      :checked="is_selected"
      @change="$emit('setSelected', $event.target.checked)"
    /> -->
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    index: Number,
    project_path: String,
    was_focused: Boolean,
    is_selectable: Boolean,
    is_selected: Boolean,
    is_already_selected: [Boolean, Object],
    tile_mode: {
      type: String,
      default: "tiny",
    },
  },
  components: {},
  data() {
    return { is_dragged: false };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    media_resolution() {
      if (this.tile_mode === "medium") return 440;
      return 220;
    },
    has_coordinates() {
      return this.file.$infos?.gps;
    },

    duration() {
      if (["video", "audio"].includes(this.file.$type))
        if (this.file.$infos.duration)
          return this.formatDurationToHoursMinutesSeconds(
            this.file.$infos.duration
          );
        else return "•:••";
      return false;
    },
  },
  methods: {
    startMediaDrag($event) {
      console.log(`MediaFocus / startMediaDrag`);
      this.is_dragged = true;
      $event.dataTransfer.setData("text/plain", JSON.stringify(this.file));
      $event.dataTransfer.effectAllowed = "move";
      this.$eventHub.$emit(`mediadrag.start`);
    },
    endMediaDrag() {
      this.is_dragged = false;
      console.log(`MediaFocus / endMediaDrag`);
      this.$eventHub.$emit(`mediadrag.end`);
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaTile {
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
  border-radius: 3px;
  // transition: all 1s 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  ._content {
    aspect-ratio: 1/1;
    overflow: hidden;

    @supports not (aspect-ratio: 1/1) {
      width: 110px;
      height: 110px;
    }
  }

  &.was--focused {
    border: 3px solid var(--active-color);
  }
  &.is--dragged {
    opacity: 0.5;
  }
  &.is--selected {
    &::after {
      content: "";
      background: var(--c-noir);
      position: absolute;
      inset: 0;
      opacity: 0.4;
      pointer-events: none;
    }
  }

  &[data-type="text"],
  &[data-type="other"] {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    text-align: center;
  }

  ::v-deep {
    ._mediaContent {
      width: 100%;
      // height: 100%;
    }

    ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      max-width: none;
    }
  }
  &[data-tilemode="table"] ::v-deep ._mediaContent--image {
    object-fit: scale-down;
  }
  &[data-tilemode="tiny"] ::v-deep ._mediaContent--image {
    object-fit: cover;
  }
  &[data-tilemode="medium"] ::v-deep ._mediaContent--image {
    object-fit: scale-down;
    border-radius: 8px;
  }

  &[data-tilemode="table"] {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    // gap: calc(var(--spacing) / 2);
    background: transparent;
    border-bottom: 1px solid white;

    // margin-top: 2px;
    // margin-bottom: 2px;
    &.was--focused {
      border: none;
      border-left: 3px solid var(--active-color);
    }

    > * {
      flex: 1 1 0;
      padding: calc(var(--spacing) / 2);

      &._content,
      &._index,
      &._hasCoordinates {
        flex: 0 0 30px;
      }
      &._alreadySelected {
        position: relative;
      }
      &._selectCb {
        flex: 0;
        position: relative;
      }
    }

    > *:not(:last-child) {
    }
  }
}

._focusMediaBtn {
  appearance: none;
  position: absolute;
  inset: 0;
  width: 100%;
  background: transparent;
  opacity: 0.3;
  transition: all 0.1s linear;

  &:hover {
    background: white;
    // background: rgba(255, 255, 255, 0.35);
    transition: none;
  }
}

._fileType {
  background: rgba(255, 255, 255, 0.5);
  color: var(--c-noir);
  border-radius: 2px;
  line-height: 1;
  font-weight: 600;

  padding: calc(var(--spacing) / 8);
  margin: calc(var(--spacing) / 8);
  font-size: var(--input-font-size-small);
  text-transform: uppercase;

  ._mediaTile:not([data-tilemode="table"]) & {
    position: absolute;
    bottom: 0;
    right: 0;
  }
}

._alreadySelected {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
  margin: calc(var(--spacing) / 4);
  pointer-events: none;

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);

  font-size: var(--sl-font-size-x-small);
  width: calc(100% - calc(var(--spacing) / 2));

  ._mediaTile[data-tilemode="medium"] & {
    bottom: 2em;
  }

  > * {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    gap: calc(var(--spacing) / 4);

    padding: calc(var(--spacing) / 8) calc(var(--spacing) / 4);
    border-radius: 1em;

    background: var(--notice-bg);
  }
}

._index {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;

  font-size: var(--input-font-size-small);
  font-weight: 800;

  background: var(--o-color, black);
  color: white;

  transition: all 0.45s cubic-bezier(0.19, 1, 0.22, 1);

  ._mediaTile[data-tilemode="table"] & {
    position: relative;
    z-index: inherit;
  }
  ._mediaTile[data-tilemode="medium"] & {
    font-size: var(--input-font-size);
  }

  ._mediaTile:hover &,
  ._mediaTile:focus-visible & {
    transform: scale(1.5);
  }
}

._hasCoordinates {
  position: absolute;
  bottom: 0;
  left: 0;
  margin: calc(var(--spacing) / 4);

  ._mediaTile[data-tilemode="table"] & {
    position: relative;
  }
  ._mediaTile[data-tilemode="medium"] & {
    bottom: 1.5rem;
  }
}

._caption {
  // position: absolute;
  // bottom: 0;
  // background: rgba(240, 240, 240, 0.5);
  width: 100%;
  padding: calc(var(--spacing) / 8) calc(var(--spacing) / 2);
  font-size: var(--sl-font-size-x-small);

  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 1;
}

._selectCb {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  line-height: 0;
  border-radius: 50%;
  font-size: 80%;
  cursor: pointer;

  ::v-deep ._inputLabel {
    padding: calc(var(--spacing) / 2);
    ._mediaTile[data-tilemode="medium"] & {
      padding: calc(var(--spacing) / 1);
    }
  }
}
</style>
