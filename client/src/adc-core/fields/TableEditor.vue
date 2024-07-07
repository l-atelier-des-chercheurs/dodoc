<template>
  <div class="_tableEditor">
    <table>
      <thead>
        <tr>
          <th v-for="(header, index) in table_header" :key="header">
            <CellEdit
              :value="header"
              :can_edit="can_edit"
              @update="updateCell({ row: 0, column: index, value: $event })"
            />
          </th>
          <th>
            <button type="button" @click="addCol">
              <b-icon icon="plus-circle" />
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in table_body" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">
            <CellEdit
              :value="cell"
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
    <!-- <div v-html="md_text"></div> -->
  </div>
</template>
<script>
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { tabletojson } from "tabletojson";
import CellEdit from "@/adc-core/fields/CellEdit.vue";

// import { mdTableToArray } from "@/adc-core/fields/markdown-table-to-html.js";

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
  created() {
    this.setContent();
  },
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
        updated_table[i].push("");
      }
      await this.updateTable(updated_table);
    },
    async updateTable(table) {
      const new_meta = {
        $content: JSON.stringify(table),
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
}

table {
  color: #333;
  background: white;
  border: 1px solid grey;
  font-size: 12pt;
  border-collapse: collapse;
}
table thead th,
table tfoot th {
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
</style>
