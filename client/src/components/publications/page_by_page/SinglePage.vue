<template>
  <div
    class="_singlePage"
    :class="{
      'is--preview': context === 'list',
    }"
  >
    <div class="_topMenu" v-if="context === 'full'">
      <div class="">
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          <sl-icon name="arrow-left-short" />
          {{ $t("pages") }}
        </button>
        &nbsp;
        <b>{{ $t("page") }} {{ page_number + 1 }}</b>
      </div>
      <div class="">
        <label class="u-label">{{ $t("zoom") }} ({{ zoom }})</label>
        <input
          type="range"
          v-model.number="zoom"
          min="0.1"
          max="2"
          step="0.1"
        />
      </div>
      <div class="">
        <label class="u-label"
          >{{ $t("gridstep") }} ({{ gridstep_in_cm }})</label
        >
        <input
          type="range"
          v-model.number="gridstep_in_cm"
          min="0.25"
          max="4"
          step=".25"
        />
      </div>
      <div class="">
        <ModuleCreator
          v-if="can_edit"
          :publication_path="publication_path"
          :page_id="page_id"
        />
      </div>
    </div>

    <div class="_container" :style="page_styles">
      <div class="_content" @click.self="active_module = false">
        <svg
          v-if="context === 'full'"
          class="_grid"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="gridSmall"
              :width="gridstep"
              :height="gridstep"
              patternUnits="userSpaceOnUse"
            >
              <path
                :d="`M ${gridstep} 0 L 0 0 0 ${gridstep}`"
                fill="none"
                stroke="rgba(207, 207, 207, 0.5)"
                strokeWidth="1"
              />
            </pattern>
            <pattern
              id="grid"
              :width="gridstep * 5"
              :height="gridstep * 5"
              patternUnits="userSpaceOnUse"
            >
              <rect
                :width="gridstep * 5"
                :height="gridstep * 5"
                fill="url(#gridSmall)"
              ></rect>
              <path
                :d="`M ${gridstep * 5} 0 L 0 0 0 ${gridstep * 5}`"
                fill="none"
                stroke="rgba(186, 186, 186, 0.5)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"></rect>
        </svg>
        <MoveableItem
          class="_item"
          v-for="publimodule in page_modules"
          :key="publimodule.$path"
          :publimodule="publimodule"
          :magnification="magnification"
          :gridstep="gridstep"
          :zoom="zoom"
          :can_edit="can_edit"
          :is_active.sync="active_module"
        />

        <ModuleCreator
          v-if="can_edit"
          :publication_path="publication_path"
          :page_id="page_id"
        />
      </div>
    </div>
  </div>
</template>
<script>
import MoveableItem from "@/components/publications/page_by_page/MoveableItem.vue";
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";

export default {
  props: {
    page_number: Number,
    context: String,
    publication_path: String,
    page_modules: Array,
    page_id: String,
    page_width: Number,
    page_height: Number,
    initial_zoom: {
      type: Number,
      default: 1,
    },
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
      gridstep_in_cm: 1,
      zoom: this.initial_zoom,

      active_module: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    page_styles() {
      return `
        --page-width: ${this.page_width * this.magnification}px;
        --page-height: ${this.page_height * this.magnification}px;
        --zoom: ${this.zoom};
      `;
    },
    gridstep() {
      return this.gridstep_in_cm * this.magnification;
    },
  },
  methods: {
    // async updateMeta({ new_meta }) {
    //   this.fetch_status = "pending";
    //   this.fetch_error = null;
    //   try {
    //     this.response = await this.$api.updateMeta({
    //       path: this.publication_path,
    //       new_meta,
    //     });
    //     this.fetch_status = "success";
    //   } catch (e) {
    //     this.fetch_status = "error";
    //     this.fetch_error = e.response.data;
    //   }
    // },
  },
};
</script>
<style lang="scss" scoped>
._singlePage {
  // padding: calc(var(--spacing) * 1);
}

._topMenu {
  position: relative;
  background: white;
  z-index: 1;
  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1);

  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
}

._container {
  width: 100%;
  height: calc(var(--page-height) * var(--zoom));
  margin: calc(var(--spacing) * 2) auto;

  .is--preview & {
    width: calc(var(--page-width) * var(--zoom));
    margin: 0 auto;
  }
}

._content {
  display: block;
  position: relative;
  z-index: 0;

  margin: 0 auto;
  width: var(--page-width, 10cm);
  height: var(--page-height, 10cm);

  transform: scale(var(--zoom));
  transform-origin: top center;

  overflow: visible;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  background: white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

  .is--preview & {
    transform-origin: top left;
  }
}

._item {
  // position: absolute;
}

._grid {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
