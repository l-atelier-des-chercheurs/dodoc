<template>
  <div class="_grid">
    <!-- Grid container wrapper -->
    <div class="_gridWrapper">
      <!-- Background grid for visual reference -->
      <div
        class="_gridBackground"
        :style="{
          display: 'grid',
          gridTemplateColumns: `repeat(${column_count || 1}, 1fr)`,
          gridTemplateRows: `repeat(${row_count || 1}, 1fr)`,
          gap: 'calc(var(--spacing) / 2)',
        }"
      >
        <div
          v-for="cellIndex in (column_count || 1) * (row_count || 1)"
          :key="'bg-' + cellIndex"
          class="_gridCell--background"
          :class="{ '_gridCell--occupied': isCellOccupied(cellIndex) }"
          @click="addAreaAtCell(cellIndex)"
        >
          <div v-if="!isCellOccupied(cellIndex)" class="_gridCell--addIcon">
            +
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
          }"
          :style="{
            gridColumnStart: area.column_start,
            gridColumnEnd: area.column_end,
            gridRowStart: area.row_start,
            gridRowEnd: area.row_end,
          }"
          @click="selectArea(area.id)"
        >
          <!-- Area label (drag handle) -->
          <div
            class="_gridArea--label"
            @mousedown.stop="startDrag(area.id, $event)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              style="margin-right: 4px"
            >
              <circle cx="4" cy="4" r="1.5" fill="currentColor" />
              <circle cx="4" cy="8" r="1.5" fill="currentColor" />
              <circle cx="4" cy="12" r="1.5" fill="currentColor" />
              <circle cx="8" cy="4" r="1.5" fill="currentColor" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              <circle cx="8" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="4" r="1.5" fill="currentColor" />
              <circle cx="12" cy="8" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
            Area {{ index + 1 }}
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
          <button
            type="button"
            class="_deleteArea"
            @click.stop="deleteArea(area.id)"
            :title="$t('delete')"
          >
            ×
          </button>
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
    };
  },
  computed: {
    column_count() {
      return this.chapter.column_count || 1;
    },
    row_count() {
      return this.chapter.row_count || 1;
    },
    grid_areas() {
      return this.chapter.grid_areas || [];
    },
  },
  methods: {
    generateUniqueId() {
      // Generate a unique ID using timestamp + random string
      return `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    updateChapter(new_meta) {
      this.$api.updateMeta({
        path: this.chapter.$path,
        new_meta,
      });
    },
    deleteArea(areaId) {
      const grid_areas = this.grid_areas.filter((area) => area.id !== areaId);
      this.updateChapter({ grid_areas });
    },
    selectArea(areaId) {
      this.selected_area_id = areaId;
    },
    findAreaById(areaId) {
      return this.grid_areas.find((area) => area.id === areaId);
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
        id: this.generateUniqueId(),
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
        row_start: area.row_start,
      };

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
        const grid_areas = this.grid_areas.map((a) =>
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
        this.updateChapter({ grid_areas });
      }
    },
    stopDrag() {
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
        const grid_areas = this.grid_areas.map((a) =>
          a.id === this.resizing_area_id
            ? {
                ...a,
                column_end: new_col_end,
                row_end: new_row_end,
              }
            : a
        );
        this.updateChapter({ grid_areas });
      }
    },
    stopResize() {
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
  background: var(--c-gris_clair);
  padding: calc(var(--spacing) / 4);
  min-height: 300px;
}

._gridBackground {
  position: relative;
  z-index: 1;
}

._gridCell--background {
  background: var(--c-blanc);
  border: 1px dashed var(--c-gris);
  height: 64px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:not(._gridCell--occupied):hover {
    background: var(--c-gris_clair);
    border-color: var(--c-bleuvert);

    ._gridCell--addIcon {
      opacity: 1;
      transform: scale(1);
    }
  }

  &._gridCell--occupied {
    cursor: default;
    opacity: 0.5;
  }
}

._gridCell--addIcon {
  font-size: 24px;
  color: var(--c-bleuvert);
  font-weight: 300;
  opacity: 0.3;
  transform: scale(0.8);
  transition: all 0.2s ease;
  pointer-events: none;
}

._gridOverlay {
  position: absolute;
  top: calc(var(--spacing) / 4);
  left: calc(var(--spacing) / 4);
  right: calc(var(--spacing) / 4);
  bottom: calc(var(--spacing) / 4);
  z-index: 2;
  pointer-events: none;
}

._gridArea {
  position: relative;
  border: 2px solid var(--c-bleuvert);
  background: var(--c-blanc);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: auto;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-color: var(--c-bleumarine);
  }

  &._gridArea--selected {
    border-color: var(--c-bleumarine);
    border-width: 3px;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
  }

  &._gridArea--dragging {
    opacity: 0.7;
    cursor: move !important;
  }

  ._gridArea--label {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    min-height: 64px;
    font-size: 14px;
    font-weight: 500;
    color: var(--c-gris);
    user-select: none;
    cursor: move;

    &:hover {
      color: var(--c-bleuvert);
    }
  }
}

._resizeHandle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  color: var(--c-bleuvert);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 2px;
  opacity: 0.6;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }

  svg {
    pointer-events: none;
  }
}

._deleteArea {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  border: none;
  background: var(--c-rouge);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;

  &:hover {
    background: darkred;
  }

  ._gridArea:hover & {
    opacity: 1;
  }
}

._addAreaButton {
  margin-top: calc(var(--spacing) * 1);
  display: flex;
  justify-content: center;
}
</style>
