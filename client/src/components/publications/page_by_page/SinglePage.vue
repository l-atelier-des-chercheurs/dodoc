<template>
  <div class="_singlePage">
    <button type="button" class="u-buttonLink" @click="$emit('close')">
      <sl-icon name="arrow-left-short" />
      {{ $t("pages") }}
    </button>

    <br />
    <br />

    <input type="range" v-model.number="magnification" />

    <div class="_singlePage--pageContent" :style="page_styles">
      <svg
        class="_grid"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="gridSmall"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="rgba(207, 207, 207, 0.2)"
              strokeWidth="1"
            ></path>
          </pattern>
          <pattern
            id="grid"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <rect width="100" height="100" fill="url(#gridSmall)"></rect>
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="rgba(186, 186, 186, 0.1)"
              strokeWidth="1"
            ></path>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"></rect>
      </svg>
      <MoveableItem
        class="_item"
        v-for="publimodule in page_modules"
        :key="publimodule.$path"
        :publimodule="publimodule"
        :can_edit="can_edit"
        :magnification="magnification"
      />
      <ModuleCreator
        v-if="can_edit"
        :publication_path="publication_path"
        :page_id="page_id"
      />
    </div>
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
      magnification: 30,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    page_styles() {
      return `
        --page-width: ${this.width * this.magnification}px;
        --page-height: ${this.height * this.magnification}px;
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
  padding: calc(var(--spacing) * 1);
}

._singlePage--pageContent {
  display: block;
  position: relative;

  margin: calc(var(--spacing) * 1) auto;
  width: var(--page-width, 10cm);
  height: var(--page-height, 10cm);

  overflow: hidden;
  // transform: scale(0.3);

  background: white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

._item {
  // position: absolute;
}

._grid {
  width: 100%;
  height: 100%;
}
</style>
