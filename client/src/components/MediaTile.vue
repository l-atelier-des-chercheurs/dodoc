<template>
  <div
    class="_mediaTile"
    :class="{
      'was--focused': was_focused,
      'was--imported': was_imported,
      'is--dragged': is_dragged,
      'is--selected': is_selected,
      'is--own': is_own_media,
    }"
    :data-type="file.$type"
    :data-tilemode="tile_mode"
  >
    <ToggleInput
      v-if="is_selectable"
      class="_selectCb"
      :content="is_selected"
      @update:content="$emit('setSelected', $event)"
    />

    <div
      class="u-nut _index"
      :style="`--o-color: var(--color-${file.$origin})`"
      :data-origin="file.$origin"
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
    <div v-if="tile_mode === 'table'" class="u-filename _filename">
      <span v-text="file.$media_filename" />
      <span
        v-if="file.$infos?.size"
        v-text="' (' + formatBytes(file.$infos.size) + ')'"
      />
    </div>

    <!-- top right  -->
    <FavSwitch
      class="_favSwitch"
      :fav="file.fav"
      :path="file.$path"
      :can_edit="true"
    />

    <!-- bottom right -->
    <div v-if="has_coordinates || tile_mode === 'table'" class="">
      <div v-if="has_coordinates" class="_hasCoordinates">
        <b-icon class="_indicator" icon="pin-map-fill" />
      </div>
      <span v-else v-text="'-'" />
    </div>

    <template>
      <!-- bottom left -->
      <span v-if="duration" class="_indicator _fileType" v-html="duration" />
      <span
        v-if="show_file_type_label"
        class="_indicator _fileType"
        v-html="show_file_type_label"
      />
    </template>

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
      :title="file.$media_filename"
      @click="$emit('toggleMediaFocus')"
    />

    <div class="_dragFileIcon">
      <DragFile :file="file" :is_dragged.sync="is_dragged" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    index: Number,
    project_path: String,
    was_focused: Boolean,
    was_imported: Boolean,
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
    return {
      is_dragged: false,
    };
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
      return this.file.$location;
    },
    is_own_media() {
      return this.isOwnItem({ folder: this.file });
    },
    duration() {
      return this.displayDuration({ media: this.file });
    },
    show_file_type_label() {
      if (this.file?.$media_filename?.endsWith(".gif")) return this.$t("gif");
      if (this.file?.$type === "stl") return this.$t("stl");
      if (this.file?.$type === "pdf") return this.$t("pdf");
      if (this.tile_mode === "table") return this.$t(this.file?.$type);
      return false;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._mediaTile {
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
  border-radius: 3px;
  padding: 0;
  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--own {
    // border-bottom: 2px solid var(--c-bleumarine);

    ._index {
      // border: 1px solid var(--c-bleumarine);

      &::after {
        content: "•";
        margin-left: calc(var(--spacing) / 8);
        color: white;
      }

      &[data-origin="make"] {
        &::after {
          // color: white;
        }
      }
    }

    // &::before {
    //   content: "";
    //   width: 100%;
    //   height: 2px;
    //   background: var(--c-bleumarine);
    //   position: absolute;
    //   z-index: 4;
    //   bottom: 0;
    //   left: 0;
    //   // margin: calc(var(--spacing) / 2);
    //   // border-radius: 50%;
    // }
  }

  ._content {
    aspect-ratio: 1/1;
    overflow: hidden;

    @supports not (aspect-ratio: 1/1) {
      width: 110px;
      height: 110px;
    }
  }

  &.was--focused,
  &.was--imported {
    border: 2px solid var(--c-noir);
    margin: 2px;
    padding: 4px;
    // background-color: var(--c-noir);
  }
  &.was--imported {
    border-color: var(--c-noir);
    // border-color: rgba(255, 255, 255, 0.4);
    animation: fadeImport 0.6s ease-in-out 3 alternate;
  }
  &.was--focused {
    border-color: var(--c-bleuvert);
  }
  &.is--dragged {
    opacity: 0.9;
    transform: rotate(5deg) scale(0.9);
  }
  &.is--selected {
    &::after {
      content: "";
      background: var(--c-bleumarine);
      position: absolute;
      inset: 0;
      opacity: 0.4;
      pointer-events: none;
    }
  }
  &[data-type="text"] {
    ._content {
      font-size: var(--sl-font-size-x-small);
    }
    padding: calc(var(--spacing) / 4);
    ::v-deep {
      ._mediaContent {
        display: block;
        text-align: left;
      }
    }
  }

  &[data-type="other"] {
    // display: flex;
    // justify-content: flex-start;
    // align-items: center;
    // text-align: center;
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
  &[data-tilemode="tiny"] {
    ::v-deep ._mediaContent--image {
      object-fit: cover;
    }
  }
  &[data-tilemode="medium"] ::v-deep ._mediaContent--image {
    object-fit: scale-down;
    border-radius: 8px;
  }

  &[data-tilemode="table"] {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    width: 100%;
    gap: calc(var(--spacing) / 2);
    background: transparent;
    border-bottom: 1px solid white;
    font-size: var(--sl-font-size-small);

    overflow: auto;

    // margin-top: 2px;
    // margin-bottom: 2px;
    &.was--focused {
      border: none;
      // border-left: 3px solid var(--active-color);
      background-color: var(--active-color);
    }
    &.is--selected {
      background-color: hsla(227, 63%, 41%, 0.4);

      &::after {
        display: none;
      }
    }

    > * {
      flex: 0 0 50px;
      padding: calc(var(--spacing) / 4);

      &._content {
        padding: 0;
      }

      &._filename {
        flex: 0 0 30ch;
        font-size: var(--sl-font-size-x-small);
      }

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
      &._caption {
        flex: 1 1 auto;
      }
    }

    > *:not(:last-child) {
    }
  }
}

// @keyframes fadeImport {
//   from {
//     transform: scale(1.02);
//   }
//   to {
//     transform: scale(1);
//   }
// }

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
  ._mediaTile:not([data-tilemode="table"]) & {
    position: absolute;
    bottom: 0;
    left: 0;
  }

  ._mediaTile[data-tilemode="medium"] & {
    bottom: 20px;
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
    border-radius: 2px;

    background: var(--notice-bg);
    color: white;

    font-weight: 600;
    text-align: center;
    text-transform: lowercase;
  }
}

._index {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;

  aspect-ratio: auto;
  border-radius: 1rem;

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
    transform: scale(1.15);
  }
}

._indicator {
  background: rgba(0, 0, 0, 0.85);
  color: white;
  border-radius: 2px;
  line-height: 1;
  font-weight: 600;
  padding: calc(var(--spacing) / 8);
  margin: calc(var(--spacing) / 8);
  font-size: var(--input-font-size-small);
  text-transform: uppercase;
}

._hasCoordinates {
  position: absolute;
  bottom: 0;
  right: 0;
  left: auto !important;

  svg {
    // color: var(--c-bleumarine);

    padding: 2px;
    width: 1rem;
    display: block;
    height: 1rem;
  }

  ._mediaTile[data-tilemode="table"] & {
    position: relative;
  }
  ._mediaTile[data-tilemode="medium"] & {
    bottom: 1.5rem;
  }
}
._favSwitch {
  position: absolute;
  top: 0;
  right: 0;
  // margin: calc(var(--spacing) / 4);
  z-index: 1;

  .u-button_icon {
    padding: calc(var(--spacing) / 3);
  }

  ._mediaTile[data-tilemode="table"] & {
    position: relative;
  }
}

._dragFileIcon {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  pointer-events: none;

  display: flex;
  place-content: center;
  place-items: center;

  ::v-deep button {
    background-color: rgba(255, 255, 255, 0.5);
    pointer-events: auto;
  }
}

._caption {
  // position: absolute;
  // bottom: 0;
  // background: rgba(240, 240, 240, 0.5);
  width: 100%;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  font-size: var(--sl-font-size-x-small);

  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 1;
}

._selectCb._selectCb {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  line-height: 0;
  border-radius: 50%;

  // width: 2rem;
  // height: 2rem;
  cursor: pointer;

  ::v-deep ._inputLabel {
    padding: var(--spacing);
  }

  ._mediaTile:not([data-tilemode="table"]) & {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;

    ::v-deep ._inputLabel {
      pointer-events: auto;
      padding: calc(var(--spacing) * 1.5);
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      cursor: pointer;

      > * {
        pointer-events: none;
      }
    }
  }
}
</style>
