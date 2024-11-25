<template>
  <div class="_tableEditor">
    <div class="_tableEditor--content">
      <table>
        <thead>
          <tr>
            <th v-for="(header, index) in table_header" :key="index">
              <CellEdit
                :cell="header"
                :can_edit="can_edit"
                @update="updateCell({ row: 0, column: index, value: $event })"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in table_body" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">
              <CellEdit
                :cell="cell"
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
          >
            <b-icon icon="plus-circle" />
          </button>
          <button
            type="button"
            class="u-button u-button_small u-button_icon"
            @click="removeCol"
          >
            <b-icon icon="dash-circle" />
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
      >
        <b-icon icon="plus-circle" />
      </button>
      <button
        type="button"
        class="u-button u-button_small u-button_icon"
        @click="removeRow"
      >
        <b-icon icon="dash-circle" />
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
    can_edit: Boolean,
  },
  components: {
    CellEdit,
  },
  data() {
    return {};
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
        let max_number_of_items_in_row = content.reduce((max, row) => {
          return Math.max(max, row.length);
        }, 0);
        content = content.map((row) =>
          row.concat(
            Array.from(
              { length: max_number_of_items_in_row - row.length },
              () => ""
            )
          )
        );
      } catch (e) {
        content = [[]];
      }
      return content;
    },
  },
  methods: {
    async updateCell({ row, column, value }) {
      const updated_table = [...this.table_content];
      updated_table[row][column] = value;
      await this.updateTable(updated_table);
    },
    async addCol() {
      const updated_table = [...this.table_content];
      for (let i = 0; i < updated_table.length; i++) {
        updated_table[i].push({ content: "" });
      }
      await this.updateTable(updated_table);
    },
    async removeCol() {
      const updated_table = [...this.table_content];
      for (let i = 0; i < updated_table.length; i++) {
        updated_table[i].pop();
      }
      await this.updateTable(updated_table);
    },
    async addRow() {
      const updated_table = [...this.table_content];
      const last_row = updated_table[updated_table.length - 1];
      const last_row_length = last_row.length || 1;
      updated_table.push(
        Array.from({ length: last_row_length }, () => ({ content: "" }))
      );
      await this.updateTable(updated_table);
    },
    async removeRow() {
      const updated_table = [...this.table_content];
      updated_table.pop();
      await this.updateTable(updated_table);
    },
    async updateTable(table) {
      const new_meta = {
        $content: JSON.stringify(table, null, 4),
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
}
._tableEditor--content {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  overflow-x: auto;
}

table {
  // color: #333;
  // background: white;
  // border: 1px solid grey;
  // font-size: 12pt;
  border-collapse: collapse;
}
table thead th,
table tfoot th {
  min-width: 100px;
  color: #777;
  background: rgba(0, 0, 0, 0.1);
}
table caption {
  padding: 0.5em;
}
table th,
table td {
  padding: 0.5em;
  border: 1px solid lightgrey;
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
