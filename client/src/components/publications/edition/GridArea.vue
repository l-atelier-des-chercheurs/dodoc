<template>
  <div
    class="_gridArea"
    :class="{
      '_gridArea--selected': isSelected,
      '_gridArea--dragging': isDragging,
      '_gridArea--updating': isUpdating,
    }"
    :style="clampedGridStyle"
    @click="$emit('select', area.id)"
    @mousedown="$emit('drag-start', area.id, $event)"
  >
    <!-- Loading overlay -->
    <div v-if="isUpdating" class="_loadingOverlay">
      <div class="_spinner"></div>
    </div>

    <!-- Area label -->
    <div class="_gridArea--label">
      <strong>{{ area.id }}</strong>
      <span v-if="area_type" class="_gridArea--type"
        >({{ $t(area_type) }})</span
      >
    </div>
    <div v-if="is_last_of_text_chain === true">
      <button
        type="button"
        class="u-button u-button_verysmall _chainButtonBtn"
        :class="{ 'is--active': is_being_chained }"
        @click="$emit('toggle-chain', area.id)"
      >
        <b-icon icon="signpost" scale="1" />
        {{ $t("continue") }}
      </button>
    </div>

    <!-- Resize handle -->
    <div
      class="_resizeHandle"
      @mousedown.stop="$emit('resize-start', area.id, $event)"
    >
      <svg width="24" height="24" viewBox="0 0 12 12">
        <path d="M12 0 L12 12 L0 12 Z" fill="currentColor" />
      </svg>
    </div>

    <!-- Delete area button -->
    <div class="_deleteArea" @click.stop>
      <RemoveMenu
        :show_button_text="false"
        :modal_title="$t('remove_area')"
        :modal_expl="$t('remove_area_confirm')"
        @remove="$emit('delete', area.id)"
      >
        <template v-slot:trigger>
          <button type="button" class="_deleteAreaBtn">
            <b-icon icon="trash" scale="1" />
          </button>
        </template>
      </RemoveMenu>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    area: {
      type: Object,
      required: true,
    },
    selectedAreaId: {
      type: String,
      default: null,
    },
    draggingAreaId: {
      type: String,
      default: null,
    },
    updatingAreaId: {
      type: String,
      default: null,
    },
    publication: {
      type: Object,
      required: true,
    },
    columnCount: {
      type: Number,
      required: true,
    },
    rowCount: {
      type: Number,
      required: true,
    },
    area_type: String,
    is_last_of_text_chain: Boolean,
    is_being_chained: Boolean,
  },
  computed: {
    clampedGridStyle() {
      // Clamp grid positions to ensure they stay within bounds
      const column_start = Math.max(
        1,
        Math.min(this.area.column_start, this.columnCount)
      );
      const column_end = Math.min(this.area.column_end, this.columnCount + 1);
      const row_start = Math.max(
        1,
        Math.min(this.area.row_start, this.rowCount)
      );
      const row_end = Math.min(this.area.row_end, this.rowCount + 1);

      return {
        gridColumnStart: column_start,
        gridColumnEnd: column_end,
        gridRowStart: row_start,
        gridRowEnd: row_end,
      };
    },
    isSelected() {
      return this.selectedAreaId === this.area.id;
    },
    isDragging() {
      return this.draggingAreaId === this.area.id;
    },
    isUpdating() {
      return this.updatingAreaId === this.area.id;
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
._gridArea {
  position: relative;
  border: 2px solid var(--c-gris);
  border-radius: var(--input-border-radius);
  background: white;
  cursor: move;
  transition: border-color 0.15s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: auto;
  box-sizing: border-box;

  &:hover {
    border-color: var(--active-color);
  }

  &._gridArea--selected {
    border-color: var(--c-bleuvert);
    // box-shadow: 0 0 0 2px rgba(94, 185, 196, 0.15);
  }

  &._gridArea--dragging {
    opacity: 0.8;
    cursor: move !important;
    border-style: dashed;
  }

  &._gridArea--updating {
    pointer-events: none;
  }

  ._gridArea--label {
    display: flex;
    justify-content: center;
    align-items: center;
    // font-weight: 600;
    user-select: none;
    pointer-events: none;
  }
}

._chainButtonBtn {
  position: relative;
  pointer-events: auto;
}
._gridArea--type {
  font-size: var(--input-font-size-small);
  color: var(--c-gris_fonce);
  text-transform: lowercase;
  margin-left: 0.5em;
}
._loadingOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

._spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--c-gris);
  border-top-color: var(--active-color);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

._resizeHandle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 1.5rem;
  height: 1.5rem;
  cursor: nwse-resize;
  color: var(--c-gris);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 10;

  ._gridArea:hover &,
  ._gridArea._gridArea--selected & {
    opacity: 0.5;
  }

  &:hover {
    opacity: 1 !important;
    color: var(--c-noir);
  }

  svg {
    pointer-events: none;
  }
}

._deleteArea {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 10;

  ._gridArea:hover &,
  ._gridArea._gridArea--selected & {
    opacity: 1;
  }
}

._deleteAreaBtn {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--c-gris);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    color: var(--c-rouge);
    transform: scale(1.1);
  }
}
</style>
