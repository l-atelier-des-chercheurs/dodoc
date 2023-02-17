<template>
  <div
    class="_singlePage"
    :class="{
      'is--preview': context === 'list',
      'is--editable': can_edit,
    }"
    @click.self="$eventHub.$emit('module.setActive', false)"
  >
    <div
      class="_container"
      :style="page_styles"
      @click.self="$eventHub.$emit('module.setActive', false)"
    >
      <div
        class="_content"
        @mousedown.self="$eventHub.$emit('module.setActive', false)"
      >
        <svg
          v-if="can_edit && show_grid"
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
                stroke="var(--c-gridlines)"
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
                stroke="var(--c-gridfiveslines)"
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
          :gridstep="show_grid && snap_to_grid ? gridstep : 1"
          :zoom="zoom"
          :can_edit="can_edit"
          :is_active="active_module.$path === publimodule.$path"
        />

        <svg
          v-if="can_edit && Object.keys(margins)"
          class="_margins"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          fill="transparent"
        >
          <rect
            :x="magnify(margins.left)"
            :y="magnify(margins.top)"
            :width="magnify(page_width - margins.left - margins.right)"
            :height="magnify(page_height - margins.top - margins.bottom)"
            stroke="rebeccapurple"
          />
        </svg>

        <svg
          v-if="can_edit && margins"
          class="_pageBorders"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          fill="transparent"
        >
          <rect
            x="0"
            y="0"
            :width="magnify(page_width)"
            :height="magnify(page_height)"
            stroke="black"
          />

          <!-- white overlay on everything outside the page -->
          <!-- <rect
            :x="-1000"
            :y="-1000"
            :width="magnify(page_width) / zoom"
            :height="magnify(page_height) / zoom"
            stroke="black"
            fill="rgba(255,255,255,.7)"
            mask="url(#globeOuterOnly)"
          /> -->

          <!-- <defs>
            <mask id="globeOuterOnly">
              <rect
                :x="(-1 * magnify(page_width)) / zoom"
                :y="(-1 * magnify(page_height)) / zoom"
                :width="magnify(page_width) / zoom"
                :height="magnify(page_height) / zoom"
                fill="white"
              />
              <rect
                x="0"
                y="0"
                :width="magnify(page_width)"
                :height="magnify(page_height)"
                fill="black"
              />
            </mask>
          </defs> -->
        </svg>
      </div>
    </div>
  </div>
</template>
<script>
import MoveableItem from "@/components/publications/page_by_page/MoveableItem.vue";

export default {
  props: {
    context: String,
    publication_path: String,
    page_modules: Array,
    page_width: Number,
    page_height: Number,
    page_color: String,
    zoom: { type: Number, default: 1 },
    show_grid: Boolean,
    snap_to_grid: Boolean,
    gridstep_in_cm: Number,
    margins: Object,
    magnification: { type: Number, default: 38 },
    can_edit: Boolean,
    active_module: [Boolean, Object],
  },
  components: {
    MoveableItem,
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
    gridstep() {
      if (!this.gridstep_in_cm) return 0;
      return this.magnify(this.gridstep_in_cm);
    },
    page_styles() {
      return `
        --page-width: ${this.magnify(this.page_width)}px;
        --page-height: ${this.magnify(this.page_height)}px;
        --zoom: ${this.zoom};
        --page-color: ${this.page_color || ""};
      `;
    },
  },
  methods: {
    magnify(m) {
      return m * this.magnification;
    },
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

._container {
  width: calc(var(--page-width));
  height: calc(var(--page-height));
  padding: 0;
  margin: calc(var(--spacing) * 4);

  transform: scale(var(--zoom));
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  .is--preview & {
    width: calc(var(--page-width) * var(--zoom));
    height: calc(var(--page-height) * var(--zoom));

    transform-origin: top left;
    margin: 0 auto;
    padding: 0;
  }
}

._content {
  display: block;
  position: relative;
  z-index: 0;

  margin: 0 auto;
  width: var(--page-width, 10cm);
  height: var(--page-height, 10cm);
  background: var(--page-color, white);

  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

  ._singlePage.is--editable & {
    overflow: visible;
  }
}

._item {
  // position: absolute;
}

._grid {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.6;

  --c-gridlines: #777;
  --c-gridfiveslines: #111;
}
._pageBorders {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  stroke-width: 2px;
}
._margins {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
