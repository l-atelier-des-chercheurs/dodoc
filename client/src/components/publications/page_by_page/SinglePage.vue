<template>
  <div class="_singlePage" :style="page_styles">
    <MoveableItem
      class="_item"
      v-for="publimodule in page_modules"
      :key="publimodule.$path"
      :publimodule="publimodule"
      :can_edit="can_edit"
    />
    <ModuleCreator
      v-if="can_edit"
      :publication_path="publication_path"
      :page_id="page_id"
    />
  </div>
</template>
<script>
import MoveableItem from "@/components/publications/page_by_page/MoveableItem.vue";
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";

export default {
  props: {
    publication_path: String,
    page_modules: Array,
    page_id: String,
    width: Number,
    height: Number,
    can_edit: Boolean,
  },
  components: {
    MoveableItem,
    ModuleCreator,
  },
  data() {
    return {
      items: [{ src: "images/i_add_publi.svg" }, { src: "images/i_add.svg" }],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    page_styles() {
      return `
        --page-width: ${this.width}cm;
        --page-height: ${this.height}cm;
      `;
    },
  },
  methods: {
    async updateMeta({ new_meta }) {
      this.fetch_status = "pending";
      this.fetch_error = null;
      try {
        this.response = await this.$api.updateMeta({
          path: this.publication_path,
          new_meta,
        });
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._singlePage {
  display: block;
  position: relative;

  width: var(--page-width, 10cm);
  height: var(--page-height, 10cm);
  // transform: scale(0.3);

  background: white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

._item {
  // position: absolute;
}
</style>
