<template>
  <div class="_tableEditor">
    <div class="_tableEditor--content">
      <table>
        <thead>
          <tr v-if="isReorderingColumns" class="column-controls-row">
            <th
              v-if="can_edit && isReorderingRows"
              class="row-controls-empty-header"
            />
            <th
              v-for="(header, index) in table_header"
              :key="'controls-' + index"
            >
              <div class="column-controls">
                <button
                  type="button"
                  class="u-button u-button_small u-button_icon"
                  @click="moveColumn(index, 'left')"
                  :disabled="index === 0"
                >
                  <b-icon icon="arrow-left-short" />
                </button>
                <button
                  type="button"
                  class="u-button u-button_small u-button_icon"
                  @click="moveColumn(index, 'right')"
                  :disabled="index === table_header.length - 1"
                >
                  <b-icon icon="arrow-right-short" />
                </button>
              </div>
            </th>
          </tr>
          <tr>
            <th
              v-if="can_edit && isReorderingRows"
              class="row-controls-empty-header"
            />
            <th v-for="(header, index) in table_header" :key="index">
              <div class="column-header">
                <CellEdit
                  :cell="header"
                  :table_path="path"
                  :table_file="table_file"
                  :can_edit="can_edit"
                  @update="updateCell({ row: 0, column: index, value: $event })"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in table_body" :key="rowIndex">
            <td
              class="row-controls"
              v-if="can_edit && isReorderingRows"
              :key="'moveupdown-' + rowIndex"
            >
              <div class="row-buttons">
                <button
                  type="button"
                  class="u-button u-button_small u-button_icon"
                  @click="moveRow(rowIndex, 'up')"
                  :disabled="rowIndex === 0"
                >
                  <b-icon icon="arrow-up-short" />
                </button>
                <button
                  type="button"
                  class="u-button u-button_small u-button_icon"
                  @click="moveRow(rowIndex, 'down')"
                  :disabled="rowIndex === table_body.length - 1"
                >
                  <b-icon icon="arrow-down-short" />
                </button>
              </div>
            </td>
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">
              <CellEdit
                :cell="cell"
                :table_path="path"
                :table_file="table_file"
                :can_edit="can_edit"
                @update="
                  updateCell({
                    row: rowIndex + 1,
                    column: cellIndex,
                    value: $event,
                  })
                "
              />
            </td>
          </tr>
        </tbody>
      </table>

      <template v-if="can_edit">
        <div class="_addColButtons">
          <button
            type="button"
            class="u-button u-button_small u-button_icon"
            @click="addCol"
            :title="$t('add_column')"
          >
            <b-icon icon="plus-circle" />
          </button>
          <button
            type="button"
            class="u-button u-button_small u-button_icon"
            @click="removeCol"
            :title="$t('remove_column')"
          >
            <b-icon icon="dash-circle" />
          </button>
          <button
            type="button"
            class="u-button u-button_small u-button_icon"
            :class="{ 'is--active': isReorderingColumns }"
            @click="toggleColumnReorderingMode"
          >
            <b-icon icon="arrow-left-right" />
          </button>
        </div>
        <div class="_addMarginToClearDragHandle" />
      </template>
    </div>
    <template v-if="can_edit">
      <button
        type="button"
        class="u-button u-button_small u-button_icon"
        @click="addRow"
        :title="$t('add_row')"
      >
        <b-icon icon="plus-circle" />
      </button>
      <button
        type="button"
        class="u-button u-button_small u-button_icon"
        @click="removeRow"
        :title="$t('remove_row')"
      >
        <b-icon icon="dash-circle" />
      </button>
      <button
        type="button"
        class="u-button u-button_small u-button_icon"
        :class="{ 'is--active': isReorderingRows }"
        @click="toggleRowReorderingMode"
      >
        <b-icon icon="arrow-left-right" rotate="90" />
      </button>
    </template>

    <!-- <div v-html="md_text"></div> -->
  </div>
</template>
<script>
import CellEdit from "@/adc-core/fields/CellEdit.vue";

export default {
  props: {
    content: String,
    path: String,
    table_file: Object,
    can_edit: Boolean,
  },
  components: {
    CellEdit,
  },
  data() {
    return {
      reorderingColumn: null,
      isReorderingColumns: false,
      isReorderingRows: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    table_header() {
      return this.table_content[0];
    },
    table_body() {
      return this.table_content.slice(1);
    },
    table_content() {
      let content = [];
      try {
        content = JSON.parse(this.content);
        if (!Array.isArray(content)) content = [[]];
      } catch (e) {
        content = [[]];
      }
      if (!content.length) content = [[]];
      let max_number_of_items_in_row = content.reduce((max, row) => {
        const row_length = Array.isArray(row) ? row.length : 0;
        return Math.max(max, row_length);
      }, 0);
      if (max_number_of_items_in_row < 1) max_number_of_items_in_row = 1;

      content = content.map((row) => {
        const safe_row = Array.isArray(row) ? row : [];
        const normalized_row = safe_row.map((cell) => this.normalizeCell(cell));
        return normalized_row.concat(
          Array.from(
            { length: max_number_of_items_in_row - normalized_row.length },
            () => this.makeEmptyCell()
          )
        );
      });
      return content;
    },
  },
  methods: {
    makeEmptyCell() {
      return {
        content_type: "",
        content: "",
        source_medias: [],
        media_width: null,
      };
    },
    normalizeCell(cell) {
      if (typeof cell === "string") {
        return {
          ...this.makeEmptyCell(),
          content: cell,
        };
      }
      if (!cell || typeof cell !== "object") return this.makeEmptyCell();

      const normalized_cell = {
        ...this.makeEmptyCell(),
        ...cell,
      };
      if (typeof normalized_cell.content !== "string")
        normalized_cell.content = "";
      if (!Array.isArray(normalized_cell.source_medias))
        normalized_cell.source_medias = [];
      return normalized_cell;
    },
    cloneTable() {
      return this.table_content.map((row) =>
        row.map((cell) => this.normalizeCell(cell))
      );
    },
    collectTableSourceMedias({ table }) {
      const source_medias_map = new Map();

      table.forEach((row) => {
        row.forEach((cell) => {
          const normalized_cell = this.normalizeCell(cell);
          const source_medias = normalized_cell.source_medias || [];
          source_medias.forEach((source_media) => {
            if (!source_media || typeof source_media !== "object") return;

            let source_media_key = "";
            if (source_media.meta_filename)
              source_media_key = `meta_filename:${source_media.meta_filename}`;
            else if (source_media.meta_filename_in_project)
              source_media_key = `meta_filename_in_project:${source_media.meta_filename_in_project}`;
            else if (source_media.path)
              source_media_key = `path:${source_media.path}`;
            else source_media_key = JSON.stringify(source_media);

            if (!source_medias_map.has(source_media_key))
              source_medias_map.set(source_media_key, source_media);
          });
        });
      });
      return Array.from(source_medias_map.values());
    },
    toggleColumnReorderingMode() {
      this.isReorderingColumns = !this.isReorderingColumns;
      if (!this.isReorderingColumns) {
        this.reorderingColumn = null;
      }
    },
    toggleRowReorderingMode() {
      this.isReorderingRows = !this.isReorderingRows;
    },
    async updateCell({ row, column, value }) {
      const updated_table = this.cloneTable();
      updated_table[row][column] = this.normalizeCell(value);
      await this.updateTable(updated_table);
    },
    async addCol() {
      const updated_table = this.cloneTable();
      for (let i = 0; i < updated_table.length; i++) {
        updated_table[i].push(this.makeEmptyCell());
      }
      await this.updateTable(updated_table);
    },
    async removeCol() {
      const updated_table = this.cloneTable();
      for (let i = 0; i < updated_table.length; i++) {
        updated_table[i].pop();
      }
      await this.updateTable(updated_table);
    },
    async addRow() {
      const updated_table = this.cloneTable();
      const last_row = updated_table[updated_table.length - 1];
      const last_row_length = last_row.length || 1;
      updated_table.push(
        Array.from({ length: last_row_length }, () => this.makeEmptyCell())
      );
      await this.updateTable(updated_table);
    },
    async removeRow() {
      const updated_table = this.cloneTable();
      updated_table.pop();
      await this.updateTable(updated_table);
    },
    async moveColumn(columnIndex, direction) {
      const updated_table = this.cloneTable();
      const newIndex = direction === "left" ? columnIndex - 1 : columnIndex + 1;

      if (newIndex < 0 || newIndex >= updated_table[0].length) return;

      // Swap columns for each row
      updated_table.forEach((row) => {
        const temp = row[columnIndex];
        row[columnIndex] = row[newIndex];
        row[newIndex] = temp;
      });

      await this.updateTable(updated_table);
    },
    async moveRow(rowIndex, direction) {
      const updated_table = this.cloneTable();
      // Add 1 to rowIndex because table_body is sliced from index 1 (after header)
      const actualRowIndex = rowIndex + 1;
      const newIndex =
        direction === "up" ? actualRowIndex - 1 : actualRowIndex + 1;

      if (newIndex < 1 || newIndex >= updated_table.length) return;

      // Swap rows
      const temp = updated_table[actualRowIndex];
      updated_table[actualRowIndex] = updated_table[newIndex];
      updated_table[newIndex] = temp;

      await this.updateTable(updated_table);
    },
    async updateTable(table) {
      const source_medias = this.collectTableSourceMedias({ table });
      const new_meta = {
        $content: JSON.stringify(table, null, 4),
        source_medias,
      };
      await this.$api.updateMeta({
        path: this.path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._tableEditor {
  width: 100%;
  overflow: auto;
  text-align: left;
  position: relative;
  // padding-left: 2.5rem;
}

.column-header {
  // display: flex;
  // flex-direction: column;
  // gap: 0.5rem;
}
.column-controls-row {
  th {
    padding: 0;
    min-width: 2rem;
  }
}
.column-controls {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  padding: 0.25rem 0;

  .is-active {
    background-color: var(--color-primary);
    color: white;
  }
}

.row-controls {
  // position: absolute;
  // left: -2.5rem;
  position: relative;
  width: 2rem;
  padding: 0;
  height: 100%;
}
.row-controls-empty-header {
  min-width: 2rem;
}

.row-buttons {
  position: absolute;
  inset: 0;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  overflow: hidden;
  justify-content: center;

  button {
    padding: calc(var(--spacing) / 8);
  }
  // gap: 0.25rem;
}

._tableEditor--content {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  overflow-x: auto;

  table {
    width: 100%;
  }
}

._addMarginToClearDragHandle {
  flex: 0 0 3rem;
}
._addColButtons {
  > * {
    display: block;
  }
}
</style>
