<template>
  <div class="_grid">
    <!-- Grid container wrapper -->
    <div class="_gridWrapper">
      <!-- Background grid for visual reference -->
      <div
        class="_gridBackground"
        :style="{
          display: 'grid',
          gridTemplateColumns: `repeat(${column_count}, 1fr)`,
          gridTemplateRows: `repeat(${row_count}, 1fr)`,
          gap: 'calc(var(--spacing) / 2)',
        }"
      >
        <div
          v-for="cellIndex in column_count * row_count"
          :key="'bg-' + cellIndex"
          class="_gridCell--background"
          :class="{ '_gridCell--occupied': isCellOccupied(cellIndex) }"
          @click="addAreaAtCell(cellIndex)"
        >
          <div v-if="!isCellOccupied(cellIndex)" class="_gridCell--addIcon">
            <b-icon icon="plus" scale="1.5" />
          </div>
        </div>
      </div>

      <!-- Overlay grid for positioning areas -->
      <div
        class="_gridOverlay"
        :style="{
          display: 'grid',
          gridTemplateColumns: `repeat(${column_count || 1}, 1fr)`,
          gridTemplateRows: `repeat(${row_count || 1}, 1fr)`,
          gap: 'calc(var(--spacing) / 2)',
        }"
      >
        <!-- Grid areas (absolutely positioned on grid) -->
        <div
          v-for="(area, index) in grid_areas"
          :key="area.id"
          class="_gridArea"
          :class="{
            '_gridArea--selected': selected_area_id === area.id,
            '_gridArea--dragging': dragging_area_id === area.id,
            '_gridArea--updating': updating_area_id === area.id,
          }"
          :style="{
            gridColumnStart: area.column_start,
            gridColumnEnd: area.column_end,
            gridRowStart: area.row_start,
            gridRowEnd: area.row_end,
          }"
          @click="selectArea(area.id)"
          @mousedown="startDrag(area.id, $event)"
        >
          <!-- Loading overlay -->
          <div v-if="updating_area_id === area.id" class="_loadingOverlay">
            <div class="_spinner"></div>
          </div>

          <!-- Area label -->
          <div class="_gridArea--label">
            {{ area.id }}
          </div>

          <!-- Resize handle -->
          <div
            class="_resizeHandle"
            @mousedown.stop="startResize(area.id, $event)"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M12 0 L12 12 L0 12 Z" fill="currentColor" />
            </svg>
          </div>

          <!-- Delete area button -->
          <div class="_deleteArea" @click.stop>
            <RemoveMenu
              :show_button_text="false"
              :modal_title="$t('remove_area')"
              :modal_expl="$t('remove_area_confirm')"
              @remove="deleteArea(area.id)"
            >
              <template v-slot:trigger>
                <button type="button" class="_deleteAreaBtn">
                  <b-icon icon="trash" scale="0.9" />
                </button>
              </template>
            </RemoveMenu>
          </div>
        </div>
      </div>
    </div>

    <!-- Add new area button (optional fallback) -->
    <div v-if="grid_areas.length === 0" class="_addAreaButton">
      <p class="u-instructions">
        {{ $t("click_empty_cell_to_add_area") }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    chapter: {
      type: Object,
      required: true,
    },
  },
  components: {},
  data() {
    return {
      selected_area_id: null,
      resizing_area_id: null,
      dragging_area_id: null,
      drag_start_pos: null,
      resize_start_pos: null,
      initial_area_position: null,
      temp_grid_areas: null,
      updating_area_id: null,
    };
  },
  computed: {
    column_count() {
      return this.chapter.column_count || 6;
    },
    row_count() {
      return this.chapter.row_count || 6;
    },
    grid_areas() {
      // Use temporary grid_areas during drag/resize operations
      return this.temp_grid_areas || this.chapter.grid_areas || [];
    },
  },
  methods: {
    generateNextLetterId() {
      // Find the next available letter ID
      const existingLetters = this.grid_areas.map((area) => area.id);
      let index = 0;
      let letter = this.getAreaLetter(index);

      // Keep incrementing until we find an unused letter
      while (existingLetters.includes(letter)) {
        index++;
        letter = this.getAreaLetter(index);
      }

      return letter;
    },
    updateChapter(new_meta) {
      this.$api.updateMeta({
        path: this.chapter.$path,
        new_meta,
      });
    },
    deleteArea(areaId) {
      this.$emit("deleteArea", areaId);
    },
    selectArea(areaId) {
      this.selected_area_id = areaId;
    },
    findAreaById(areaId) {
      return this.grid_areas.find((area) => area.id === areaId);
    },
    getAreaLetter(index) {
      // Convert index to letter (A, B, C, ..., Z, AA, AB, ...)
      let letter = "";
      let num = index;
      while (num >= 0) {
        letter = String.fromCharCode(65 + (num % 26)) + letter;
        num = Math.floor(num / 26) - 1;
      }
      return letter;
    },
    getCellPosition(cellIndex) {
      // Convert 1-based cellIndex to column and row (1-based for CSS Grid)
      const row = Math.ceil(cellIndex / this.column_count);
      const col = ((cellIndex - 1) % this.column_count) + 1;
      return { col, row };
    },
    isCellOccupied(cellIndex) {
      const { col, row } = this.getCellPosition(cellIndex);
      return this.grid_areas.some((area) => {
        return (
          col >= area.column_start &&
          col < area.column_end &&
          row >= area.row_start &&
          row < area.row_end
        );
      });
    },
    addAreaAtCell(cellIndex) {
      if (this.isCellOccupied(cellIndex)) return;

      const { col, row } = this.getCellPosition(cellIndex);
      const new_area = {
        id: this.generateNextLetterId(),
        column_start: col,
        column_end: col + 1,
        row_start: row,
        row_end: row + 1,
      };
      const grid_areas = [...this.grid_areas, new_area];
      this.updateChapter({ grid_areas });
    },
    // Drag to move area
    startDrag(areaId, event) {
      this.dragging_area_id = areaId;
      this.drag_start_pos = { x: event.clientX, y: event.clientY };
      const area = this.findAreaById(areaId);
      this.initial_area_position = {
        column_start: area.column_start,
        column_end: area.column_end,
        row_start: area.row_start,
        row_end: area.row_end,
      };
      // Clone grid_areas for local manipulation during drag
      this.temp_grid_areas = JSON.parse(
        JSON.stringify(this.chapter.grid_areas || [])
      );

      document.addEventListener("mousemove", this.handleDrag);
      document.addEventListener("mouseup", this.stopDrag);
    },
    handleDrag(event) {
      if (this.dragging_area_id === null) return;

      const container = this.$el.querySelector("._gridOverlay");
      const rect = container.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(container).gap.replace("px", ""));
      const cellWidth =
        (rect.width - gap * (this.column_count - 1)) / this.column_count;
      const cellHeight =
        (rect.height - gap * (this.row_count - 1)) / this.row_count;

      const deltaX = event.clientX - this.drag_start_pos.x;
      const deltaY = event.clientY - this.drag_start_pos.y;

      const colChange = Math.round(deltaX / (cellWidth + gap));
      const rowChange = Math.round(deltaY / (cellHeight + gap));

      const area = this.findAreaById(this.dragging_area_id);
      const col_span = area.column_end - area.column_start;
      const row_span = area.row_end - area.row_start;

      let new_col_start = this.initial_area_position.column_start + colChange;
      let new_row_start = this.initial_area_position.row_start + rowChange;

      // Constrain to grid bounds
      new_col_start = Math.max(
        1,
        Math.min(new_col_start, this.column_count - col_span + 1)
      );
      new_row_start = Math.max(
        1,
        Math.min(new_row_start, this.row_count - row_span + 1)
      );

      const new_col_end = new_col_start + col_span;
      const new_row_end = new_row_start + row_span;

      if (
        new_col_start !== area.column_start ||
        new_row_start !== area.row_start
      ) {
        // Update temp_grid_areas instead of calling updateChapter
        this.temp_grid_areas = this.temp_grid_areas.map((a) =>
          a.id === this.dragging_area_id
            ? {
                ...a,
                column_start: new_col_start,
                column_end: new_col_end,
                row_start: new_row_start,
                row_end: new_row_end,
              }
            : a
        );
      }
    },
    stopDrag() {
      // Save the final state when drag stops, only if position changed
      if (this.temp_grid_areas && this.dragging_area_id) {
        const final_area = this.temp_grid_areas.find(
          (a) => a.id === this.dragging_area_id
        );

        // Check if position actually changed
        const has_changed =
          final_area.column_start !== this.initial_area_position.column_start ||
          final_area.column_end !== this.initial_area_position.column_end ||
          final_area.row_start !== this.initial_area_position.row_start ||
          final_area.row_end !== this.initial_area_position.row_end;

        if (has_changed) {
          this.updating_area_id = this.dragging_area_id;
          this.updateChapter({ grid_areas: this.temp_grid_areas });

          // Keep temp_grid_areas and clear after a short delay to prevent flashing
          setTimeout(() => {
            this.temp_grid_areas = null;
            this.updating_area_id = null;
          }, 100);
        } else {
          // No change, just clear temp state immediately
          this.temp_grid_areas = null;
        }
      }

      this.dragging_area_id = null;
      this.drag_start_pos = null;
      this.initial_area_position = null;
      document.removeEventListener("mousemove", this.handleDrag);
      document.removeEventListener("mouseup", this.stopDrag);
    },
    // Resize area
    startResize(areaId, event) {
      this.resizing_area_id = areaId;
      this.resize_start_pos = { x: event.clientX, y: event.clientY };
      const area = this.findAreaById(areaId);
      this.initial_area_position = {
        column_end: area.column_end,
        row_end: area.row_end,
      };
      // Clone grid_areas for local manipulation during resize
      this.temp_grid_areas = JSON.parse(
        JSON.stringify(this.chapter.grid_areas || [])
      );

      document.addEventListener("mousemove", this.handleResize);
      document.addEventListener("mouseup", this.stopResize);
    },
    handleResize(event) {
      if (this.resizing_area_id === null) return;

      const container = this.$el.querySelector("._gridOverlay");
      const rect = container.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(container).gap.replace("px", ""));
      const cellWidth =
        (rect.width - gap * (this.column_count - 1)) / this.column_count;
      const cellHeight =
        (rect.height - gap * (this.row_count - 1)) / this.row_count;

      const deltaX = event.clientX - this.resize_start_pos.x;
      const deltaY = event.clientY - this.resize_start_pos.y;

      const colChange = Math.round(deltaX / (cellWidth + gap));
      const rowChange = Math.round(deltaY / (cellHeight + gap));

      const area = this.findAreaById(this.resizing_area_id);

      let new_col_end = this.initial_area_position.column_end + colChange;
      let new_row_end = this.initial_area_position.row_end + rowChange;

      // Constrain to grid bounds and minimum size
      new_col_end = Math.max(
        area.column_start + 1,
        Math.min(new_col_end, this.column_count + 1)
      );
      new_row_end = Math.max(
        area.row_start + 1,
        Math.min(new_row_end, this.row_count + 1)
      );

      if (new_col_end !== area.column_end || new_row_end !== area.row_end) {
        // Update temp_grid_areas instead of calling updateChapter
        this.temp_grid_areas = this.temp_grid_areas.map((a) =>
          a.id === this.resizing_area_id
            ? {
                ...a,
                column_end: new_col_end,
                row_end: new_row_end,
              }
            : a
        );
      }
    },
    stopResize() {
      // Save the final state when resize stops, only if size changed
      if (this.temp_grid_areas && this.resizing_area_id) {
        const final_area = this.temp_grid_areas.find(
          (a) => a.id === this.resizing_area_id
        );

        // Check if size actually changed
        const has_changed =
          final_area.column_end !== this.initial_area_position.column_end ||
          final_area.row_end !== this.initial_area_position.row_end;

        if (has_changed) {
          this.updating_area_id = this.resizing_area_id;
          this.updateChapter({ grid_areas: this.temp_grid_areas });

          // Keep temp_grid_areas and clear after a short delay to prevent flashing
          setTimeout(() => {
            this.temp_grid_areas = null;
            this.updating_area_id = null;
          }, 100);
        } else {
          // No change, just clear temp state immediately
          this.temp_grid_areas = null;
        }
      }

      this.resizing_area_id = null;
      this.resize_start_pos = null;
      this.initial_area_position = null;
      document.removeEventListener("mousemove", this.handleResize);
      document.removeEventListener("mouseup", this.stopResize);
    },
  },
  beforeDestroy() {
    document.removeEventListener("mousemove", this.handleResize);
    document.removeEventListener("mouseup", this.stopResize);
    document.removeEventListener("mousemove", this.handleDrag);
    document.removeEventListener("mouseup", this.stopDrag);
  },
};
</script>

<style lang="scss" scoped>
._grid {
  margin-bottom: calc(var(--spacing) * 1);
}

._gridWrapper {
  position: relative;
  background: transparent;
  padding: 0;
}

._gridBackground {
  position: relative;
  z-index: 1;
}

._gridCell--background {
  background: transparent;
  outline: 1px dashed var(--c-gris);
  background: var(--c-gris);
  outline-offset: -1px;
  height: 80px;
  border-radius: var(--input-border-radius);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;

  &:not(._gridCell--occupied):hover {
    background: rgba(0, 0, 0, 0.02);
    outline-color: var(--c-gris);

    ._gridCell--addIcon {
      opacity: 0.7;
      color: var(--active-color);
    }
  }

  &._gridCell--occupied {
    cursor: default;
    opacity: 0.3;
  }
}

._gridCell--addIcon {
  font-size: 20px;
  color: white;
}

._gridOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
}

._gridArea {
  position: relative;
  border: 2px solid var(--c-gris);
  background: white;
  cursor: move;
  transition: border-color 0.15s ease;
  display: flex;
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
    box-shadow: 0 0 0 2px rgba(94, 185, 196, 0.15);
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
    font-weight: 600;
    user-select: none;
    pointer-events: none;
  }
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
  width: 16px;
  height: 16px;
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

._addAreaButton {
  margin-top: calc(var(--spacing) * 1);
  display: flex;
  justify-content: center;
}
</style>
