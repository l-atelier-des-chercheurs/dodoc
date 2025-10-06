<template>
  <div
    class="_singlePage"
    :class="{
      'is--preview': context === 'preview',
      'is--editable': can_edit,
    }"
  >
    <div class="_pagecontainer" :style="page_styles">
      <div class="_pagecontent">
        <svg
          v-if="can_edit && show_grid"
          class="_grid"
          :data-position="grid_z_index"
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
          :context="context"
          :key="publimodule.$path"
          :publimodule="publimodule"
          :magnification="magnification"
          :gridstep="show_grid && snap_to_grid ? gridstep : 1"
          :module_being_edited.sync="module_being_edited"
          :scale="scale"
          :can_edit="can_edit"
          :is_active="active_module.$path === publimodule.$path"
        />

        <svg
          v-if="can_edit && l_margins"
          class="_margins"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          fill="transparent"
        >
          <rect
            :x="magnify(l_margins.left)"
            :y="magnify(l_margins.top)"
            :width="magnify(page_width - l_margins.left - l_margins.right)"
            :height="magnify(page_height - l_margins.top - l_margins.bottom)"
          />
        </svg>

        <div
          class="_pagination"
          v-if="pagination && !hide_pagination && page_number_corrected > 0"
          :style="pagination_styles"
        >
          {{ page_number_corrected }}
        </div>

        <svg
          v-if="can_edit"
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
    page_modules: Array,
    page_width: Number,
    page_height: Number,
    layout_mode: {
      type: String,
      default: "print",
    },
    page_color: String,
    hide_pagination: Boolean,
    zoom: { type: Number, default: 1 },
    scale: { type: Number, default: 1 },
    show_grid: { type: Boolean, default: false },
    snap_to_grid: { type: Boolean, default: false },
    grid_z_index: { type: String, default: "under" },
    gridstep_in_mm: Number,
    margins: Object,
    page_number: Number,
    pagination: [Boolean, Object],
    active_module: [Boolean, Object],
    page_is_left: Boolean,
    can_edit: Boolean,
  },
  components: {
    MoveableItem,
  },
  data() {
    return {
      module_being_edited: undefined,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    l_margins() {
      if (Object.keys(this.margins).length === 0) return false;
      if (
        this.margins.left === 0 &&
        this.margins.right === 0 &&
        this.margins.top === 0 &&
        this.margins.bottom === 0
      )
        return false;

      if (this.page_is_left === true)
        return {
          left: this.margins.right,
          right: this.margins.left,
          top: this.margins.top,
          bottom: this.margins.bottom,
        };
      else return this.margins;
    },
    gridstep() {
      if (!this.gridstep_in_mm) return 0;
      return this.magnify(this.gridstep_in_mm);
    },
    magnification() {
      if (this.layout_mode === "screen") return 1;
      return this.$root.page_magnification;
    },
    page_styles() {
      const props = {};

      if (this.page_width && this.page_height) {
        props["--page-width"] = `${this.magnify(this.page_width)}px`;
        props["--page-height"] = `${this.magnify(this.page_height)}px`;
      }

      props["--zoom"] = this.zoom;
      props["--page-color"] = this.page_color || "#fff";

      return props;
    },
    page_number_corrected() {
      return this.page_number - this.pagination.pagination_start_on_page + 1;
    },
    pagination_styles() {
      const props = {};

      if (this.page_is_left === true) {
        props["--pagination-left"] = `${this.magnify(this.pagination.right)}px`;
      } else {
        props["--pagination-right"] = `${this.magnify(
          this.pagination.right
        )}px`;
      }

      props["--pagination-bottom"] = `${this.magnify(
        this.pagination.bottom
      )}px`;

      return props;
    },
  },
  methods: {
    magnify(m) {
      return m * this.magnification;
    },
  },
};
</script>
<style lang="scss" scoped>
._singlePage {
  // padding: calc(var(--spacing) * 1);
}

._pagecontainer {
  width: calc(var(--page-width));
  height: calc(var(--page-height));
  padding: 0;
  // margin: calc(var(--spacing) * 4);

  transform: scale(var(--zoom));
  transform-origin: 0 0;

  contain: size;

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  .is--preview & {
    width: calc(var(--page-width) * var(--zoom));
    height: calc(var(--page-height) * var(--zoom));

    transform-origin: left top;
    margin: 0 auto;
    padding: 0;
  }
}

._pagecontent {
  display: block;
  position: relative;
  z-index: 0;

  // margin: 0 auto;
  margin: 0;
  width: var(--page-width, 100mm);
  height: var(--page-height, 100mm);
  background: var(--page-color, white);

  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.16);

  transition: background 0.4s cubic-bezier(0.19, 1, 0.22, 1);

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

  &[data-position="under"] {
    z-index: -10000;
  }
  &[data-position="over"] {
    z-index: 10000;
  }

  --c-gridlines: #aaa;
  --c-gridfiveslines: #111;
}
._pageBorders {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  pointer-events: none;
  stroke-width: 2px;
}
._margins {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  stroke-width: 2px;
  stroke: hsl(280, 97%, 70%);
}

._pagination {
  position: absolute;
  right: var(--pagination-right);
  left: var(--pagination-left);
  bottom: var(--pagination-bottom);
  font-weight: 500;
  line-height: 0.5;
  font-size: var(--sl-font-size-large);
}
</style>
