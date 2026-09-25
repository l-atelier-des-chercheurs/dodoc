<template>
  <div class="_grid">
    <!-- Max grid area reached message (Z already exists, no more single letters) -->

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
          :class="{
            '_gridCell--occupied': isCellOccupied(cellIndex),
            '_gridCell--maxGridAreaReached': max_grid_area_reached,
          }"
          @click="addAreaAtCell(cellIndex)"
        >
          <div
            v-if="!isCellOccupied(cellIndex) && !max_grid_area_reached"
            class="_gridCell--addIcon"
          >
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
        <GridArea
          v-for="(area, index) in grid_areas"
          :key="area.id"
          :area="area"
          :area_type="getAreaFileType(area)"
          :is_last_of_text_chain="isLastOfTextChain(area)"
          :is_being_chained="toggle_chain_area_id === area.id"
          :selected-area-id="selected_area_id"
          :dragging-area-id="dragging_area_id"
          :updating-area-id="updating_area_id"
          :publication="publication"
          :column-count="column_count"
          :row-count="row_count"
          @select="selectArea"
          @drag-start="startDrag"
          @resize-start="startResize"
          @toggle-chain="toggleChain"
          @delete="deleteArea"
        />
      </div>

      <!-- SVG overlay for drawing links between chained areas -->
      <svg
        v-if="text_chain_links.length > 0"
        class="_linksOverlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          v-for="(link, index) in text_chain_links"
          :key="`link-${index}`"
          :d="link.path"
          fill="none"
          stroke="var(--c-bleuvert)"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.6"
        />
      </svg>
    </div>

    <div class="_addAreaButton">
      <p class="u-instructions" v-if="grid_areas.length === 0">
        {{ $t("click_empty_cell_to_add_area") }}
      </p>
      <p v-if="max_grid_area_reached" class="u-warning">
        {{ $t("max_grid_area_reached") }}
      </p>
      <p v-if="toggle_chain_area_id" class="">
        {{ $t("click_on_another_cell_to_continue") }}
      </p>
    </div>
  </div>
</template>

<script>
import GridArea from "./GridArea.vue";

export default {
  props: {
    chapter: {
      type: Object,
      required: true,
    },
    publication: {
      type: Object,
      required: true,
    },
  },
  components: {
    GridArea,
  },
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
      toggle_chain_area_id: null,
      is_mounted: false,
      container_size: { width: 0, height: 0 },
      resize_observer: null,
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
      const areas = this.temp_grid_areas || this.chapter.grid_areas || [];
      // Clamp all areas to grid bounds
      return areas.map((area) => this.clampAreaToBounds(area));
    },
    max_grid_area_reached() {
      // Check if all single letters from A to Z are used as area IDs
      if (!this.chapter.grid_areas || this.toggle_chain_area_id) return false;
      const letterSet = new Set();
      this.chapter.grid_areas.forEach((area) => {
        if (/^[A-Z]$/.test(area.id)) {
          letterSet.add(area.id);
        }
      });
      const alphabet = Array.from({ length: 26 }, (_, i) =>
        String.fromCharCode(65 + i)
      );
      return alphabet.every((letter) => letterSet.has(letter));
    },
    text_chain_links() {
      // Don't calculate links until DOM is ready
      if (!this.is_mounted || !this.$el) {
        return [];
      }

      // Verify the grid overlay container exists
      const container = this.$el.querySelector("._gridOverlay");
      if (!container) {
        return [];
      }

      // Access container_size to make this computed property reactive to resize changes
      // eslint-disable-next-line no-unused-vars
      const _ = this.container_size.width + this.container_size.height;

      // Get all text chains and generate links between consecutive areas
      const links = [];
      const text_chains = this.getTextChains();

      text_chains.forEach((chain) => {
        if (chain.length < 2) return;

        // Sort chain by numeric suffix
        const sorted_chain = [...chain].sort((a, b) => {
          const matchA = a.id.match(/^([A-Z]+)(\d*)$/);
          const matchB = b.id.match(/^([A-Z]+)(\d*)$/);
          const numA = matchA[2] ? parseInt(matchA[2]) : 0;
          const numB = matchB[2] ? parseInt(matchB[2]) : 0;
          return numA - numB;
        });

        // Generate links between consecutive areas
        for (let i = 0; i < sorted_chain.length - 1; i++) {
          const from_area = sorted_chain[i];
          const to_area = sorted_chain[i + 1];
          const path = this.generateLinkPath(from_area, to_area);
          if (path) {
            links.push({ path, from: from_area.id, to: to_area.id });
          }
        }
      });

      return links;
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
    async deleteArea(areaId) {
      this.$eventHub.$emit("gridArea.delete", areaId);
      // Remove area from grid_areas
      const grid_areas = this.chapter.grid_areas.filter(
        (area) => area.id !== areaId
      );
      const source_medias = this.getGridEmbeddedSourceMedias({ grid_areas });
      this.updateChapter({ grid_areas, source_medias });
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
    getAreaMediaFileType(area) {
      const source_media = area.source_medias?.[0];
      if (!source_media) return null;

      const file = this.getSourceMedia({
        source_media,
        folder_path: this.publication.$path,
      });

      if (!file) return null;

      if (file.$type === "text" || file.content_type === "markdown") {
        return "text";
      } else if (file.$type === "image") {
        return "image";
      }
      return null;
    },
    getAreaFileType(area) {
      // if area is part of a text chain, return text
      if (this.isPartOfTextChain(area)) {
        return "text";
      }

      return this.getAreaMediaFileType(area);
    },
    getCellPosition(cellIndex) {
      // Convert 1-based cellIndex to column and row (1-based for CSS Grid)
      const row = Math.ceil(cellIndex / this.column_count);
      const col = ((cellIndex - 1) % this.column_count) + 1;
      return { col, row };
    },
    clampAreaToBounds(area) {
      // Ensure area stays within grid bounds
      const col_span = area.column_end - area.column_start;
      const row_span = area.row_end - area.row_start;

      // Clamp start positions
      let column_start = Math.max(
        1,
        Math.min(area.column_start, this.column_count)
      );
      let row_start = Math.max(1, Math.min(area.row_start, this.row_count));

      // Ensure end positions don't exceed grid bounds
      let column_end = Math.min(column_start + col_span, this.column_count + 1);
      let row_end = Math.min(row_start + row_span, this.row_count + 1);

      // Ensure minimum size of 1x1
      if (column_end <= column_start) {
        column_end = column_start + 1;
      }
      if (row_end <= row_start) {
        row_end = row_start + 1;
      }

      // Adjust start if end would exceed bounds
      if (column_end > this.column_count + 1) {
        column_start = Math.max(1, this.column_count + 1 - col_span);
        column_end = this.column_count + 1;
      }
      if (row_end > this.row_count + 1) {
        row_start = Math.max(1, this.row_count + 1 - row_span);
        row_end = this.row_count + 1;
      }

      return {
        ...area,
        column_start,
        column_end,
        row_start,
        row_end,
      };
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
    async addAreaAtCell(cellIndex) {
      if (this.isCellOccupied(cellIndex) || this.max_grid_area_reached) return;

      const { col, row } = this.getCellPosition(cellIndex);

      // Ensure the cell is within bounds
      if (col > this.column_count || row > this.row_count) return;

      let new_area_id;

      if (this.toggle_chain_area_id) {
        // Find the last area in this chain
        const match = this.toggle_chain_area_id.match(/^([A-Z]+)(\d*)$/);

        if (match) {
          const letterPart = match[1];
          const chain = this.grid_areas.filter((a) => {
            const m = a.id.match(/^([A-Z]+)(\d*)$/);
            return m && m[1] === letterPart;
          });

          // Calculate max index
          let maxIndex = 0;
          chain.forEach((a) => {
            const m = a.id.match(/^([A-Z]+)(\d*)$/);
            if (m && m[2]) {
              const idx = parseInt(m[2]);
              if (!isNaN(idx) && idx > maxIndex) maxIndex = idx;
            }
          });

          new_area_id = letterPart + (maxIndex + 1);
        } else {
          // Fallback if ID doesn't match expected pattern
          new_area_id = this.generateNextLetterId();
        }
        this.toggle_chain_area_id = null;
      } else {
        new_area_id = this.generateNextLetterId();
      }

      const new_area = {
        id: new_area_id,
        column_start: Math.min(col, this.column_count),
        column_end: Math.min(col + 1, this.column_count + 1),
        row_start: Math.min(row, this.row_count),
        row_end: Math.min(row + 1, this.row_count + 1),
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

      // Constrain to grid bounds - ensure area doesn't go outside grid
      new_col_start = Math.max(
        1,
        Math.min(new_col_start, Math.max(1, this.column_count - col_span + 1))
      );
      new_row_start = Math.max(
        1,
        Math.min(new_row_start, Math.max(1, this.row_count - row_span + 1))
      );

      const new_col_end = Math.min(
        new_col_start + col_span,
        this.column_count + 1
      );
      const new_row_end = Math.min(
        new_row_start + row_span,
        this.row_count + 1
      );

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
      // Ensure end doesn't exceed grid bounds
      new_col_end = Math.max(
        area.column_start + 1,
        Math.min(new_col_end, this.column_count + 1)
      );
      new_row_end = Math.max(
        area.row_start + 1,
        Math.min(new_row_end, this.row_count + 1)
      );

      // If resize would exceed bounds, clamp it
      if (new_col_end > this.column_count + 1) {
        new_col_end = this.column_count + 1;
      }
      if (new_row_end > this.row_count + 1) {
        new_row_end = this.row_count + 1;
      }

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
    toggleChain(areaId) {
      if (this.toggle_chain_area_id === areaId) {
        this.toggle_chain_area_id = null;
      } else {
        this.toggle_chain_area_id = areaId;
      }
    },
    // check if part of chain, if it is get the first area type
    getFirstAreaTypeInChain(area) {
      const match = area.id.match(/^([A-Z]+)(\d*)$/);
      if (!match) return null;
      const letterPart = match[1];
      const chain = this.grid_areas.filter((a) => {
        const m = a.id.match(/^([A-Z]+)(\d*)$/);
        return m && m[1] === letterPart;
      });

      if (chain.length === 0) return null;

      // Sort to find the first one
      chain.sort((a, b) => {
        const matchA = a.id.match(/^([A-Z]+)(\d*)$/);
        const matchB = b.id.match(/^([A-Z]+)(\d*)$/);
        const numA = matchA[2] ? parseInt(matchA[2]) : 0;
        const numB = matchB[2] ? parseInt(matchB[2]) : 0;
        return numA - numB;
      });

      return this.getAreaMediaFileType(chain[0]);
    },
    isPartOfTextChain(area) {
      return this.getFirstAreaTypeInChain(area) === "text";
    },
    isLastOfTextChain(area) {
      if (this.getFirstAreaTypeInChain(area) !== "text") return false;

      const match = area.id.match(/^([A-Z]+)(\d*)$/);
      if (!match) return false;
      const letterPart = match[1];
      const chain = this.grid_areas.filter((a) => {
        const m = a.id.match(/^([A-Z]+)(\d*)$/);
        return m && m[1] === letterPart;
      });

      if (chain.length <= 1) return true;

      // Sort by suffix numeric value
      chain.sort((a, b) => {
        const matchA = a.id.match(/^([A-Z]+)(\d*)$/);
        const matchB = b.id.match(/^([A-Z]+)(\d*)$/);

        const numA = matchA[2] ? parseInt(matchA[2]) : 0;
        const numB = matchB[2] ? parseInt(matchB[2]) : 0;
        return numA - numB;
      });

      const last = chain[chain.length - 1];
      return last.id === area.id;
    },
    getTextChains() {
      // Group areas by their chain letter prefix
      const chains_map = {};

      this.grid_areas.forEach((area) => {
        if (!this.isPartOfTextChain(area)) return;

        const match = area.id.match(/^([A-Z]+)(\d*)$/);
        if (!match) return;

        const letterPart = match[1];
        if (!chains_map[letterPart]) {
          chains_map[letterPart] = [];
        }
        chains_map[letterPart].push(area);
      });

      return Object.values(chains_map);
    },
    getAreaPixelPosition(area) {
      // Calculate pixel position of an area based on grid layout
      const container = this.$el?.querySelector("._gridOverlay");
      if (!container) return null;

      const rect = container.getBoundingClientRect();
      const gap_str = getComputedStyle(container).gap || "0px";
      const gap = parseFloat(gap_str.replace("px", "")) || 0;
      const cell_width =
        (rect.width - gap * (this.column_count - 1)) / this.column_count;
      const cell_height =
        (rect.height - gap * (this.row_count - 1)) / this.row_count;

      // Calculate position relative to the grid overlay (which is the same as SVG container)
      const x = (area.column_start - 1) * (cell_width + gap);
      const y = (area.row_start - 1) * (cell_height + gap);

      const width =
        (area.column_end - area.column_start) * cell_width +
        gap * (area.column_end - area.column_start - 1);
      const height =
        (area.row_end - area.row_start) * cell_height +
        gap * (area.row_end - area.row_start - 1);

      return { x, y, width, height };
    },
    generateLinkPath(from_area, to_area) {
      const from_pos = this.getAreaPixelPosition(from_area);
      const to_pos = this.getAreaPixelPosition(to_area);

      if (!from_pos || !to_pos) return null;

      // Calculate connection points
      // Exit point: right edge center of from_area
      const exit_x = from_pos.x + from_pos.width;
      const exit_y = from_pos.y + from_pos.height / 2;

      // Entry point: left edge center of to_area
      const entry_x = to_pos.x;
      const entry_y = to_pos.y + to_pos.height / 2;

      // Calculate control points for bezier curve
      const dx = entry_x - exit_x;
      const control_offset = Math.abs(dx) * 0.5; // Adjust curve intensity

      const cp1_x = exit_x + control_offset;
      const cp1_y = exit_y;
      const cp2_x = entry_x - control_offset;
      const cp2_y = entry_y;

      // Generate SVG path with bezier curve
      return `M ${exit_x} ${exit_y} C ${cp1_x} ${cp1_y}, ${cp2_x} ${cp2_y}, ${entry_x} ${entry_y}`;
    },
  },
  mounted() {
    // Wait for DOM to be fully rendered before calculating link positions
    this.$nextTick(() => {
      this.is_mounted = true;

      // Set up ResizeObserver to watch for grid container size changes
      const container = this.$el?.querySelector("._gridOverlay");
      if (container && window.ResizeObserver) {
        this.resize_observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            // Update container_size to trigger recalculation of text_chain_links
            this.container_size = {
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            };
          }
        });
        this.resize_observer.observe(container);
      }
    });
  },
  beforeDestroy() {
    document.removeEventListener("mousemove", this.handleResize);
    document.removeEventListener("mouseup", this.stopResize);
    document.removeEventListener("mousemove", this.handleDrag);
    document.removeEventListener("mouseup", this.stopDrag);

    // Clean up ResizeObserver
    if (this.resize_observer) {
      this.resize_observer.disconnect();
      this.resize_observer = null;
    }
  },
};
</script>

<style lang="scss" scoped>
._grid {
  margin-bottom: calc(var(--spacing) * 1);
}

._maxGridAreaMessage {
  margin: calc(var(--spacing) * 0.5) auto;
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
  background: var(--c-gris_clair);
  color: var(--c-gris_fonce);
  outline-offset: -1px;
  height: 60px;
  border-radius: var(--input-border-radius);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;

  ._gridCell--addIcon {
    color: var(--c-gris);
  }

  &:not(._gridCell--occupied):not(._gridCell--maxGridAreaReached):hover {
    background: rgba(0, 0, 0, 0.02);
    outline: 1px dashed var(--c-gris);

    ._gridCell--addIcon {
      opacity: 1;
    }
  }

  &._gridCell--occupied {
    cursor: default;
    opacity: 0.3;
  }
  &._gridCell--maxGridAreaReached {
    cursor: default;
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

._linksOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  overflow: visible;
}

._addAreaButton {
  margin-top: calc(var(--spacing) * 1);
  display: flex;
  justify-content: center;
}
</style>
