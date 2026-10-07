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
          :snap_targets="can_edit && smart_guides && snap_targets"
          @guides="guides = $event"
        />

        <svg
          v-if="guides.length > 0"
          class="_smartGuides"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            v-for="guide in guides"
            :key="guide.axis + guide.pos"
            :x1="guide.axis === 'x' ? guide.pos : 0"
            :x2="guide.axis === 'x' ? guide.pos : magnify(page_width)"
            :y1="guide.axis === 'y' ? guide.pos : 0"
            :y2="guide.axis === 'y' ? guide.pos : magnify(page_height)"
            vector-effect="non-scaling-stroke"
          />
          <rect
            v-for="rect in snap_source_rects"
            :key="rect.path"
            :x="rect.x"
            :y="rect.y"
            :width="rect.width"
            :height="rect.height"
            vector-effect="non-scaling-stroke"
          />
        </svg>

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
    smart_guides: { type: Boolean, default: false },
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
      guides: [],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    snap_targets() {
      // in px: page edges and middle, margins and their middle, other modules' edges
      // centers only snap to centers, see MoveableItem
      const w = this.magnify(this.page_width);
      const h = this.magnify(this.page_height);
      const x = [{ pos: 0 }, { pos: w / 2, center: true }, { pos: w }];
      const y = [{ pos: 0 }, { pos: h / 2, center: true }, { pos: h }];

      if (this.l_margins) {
        const left = this.magnify(this.l_margins.left);
        const right = w - this.magnify(this.l_margins.right);
        const top = this.magnify(this.l_margins.top);
        const bottom = h - this.magnify(this.l_margins.bottom);
        x.push(
          { pos: left },
          { pos: right },
          { pos: (left + right) / 2, center: true }
        );
        y.push(
          { pos: top },
          { pos: bottom },
          { pos: (top + bottom) / 2, center: true }
        );
      }

      // rotated modules are left out, their box doesn't match what is seen
      const modules = this.page_modules
        .filter(
          (m) =>
            !m.rotation &&
            ["x", "y", "width", "height"].every((k) => typeof m[k] === "number")
        )
        .map((m) => {
          const mx = this.magnify(m.x);
          const my = this.magnify(m.y);
          const source = m.$path;
          return {
            path: m.$path,
            x: [
              { pos: mx, source },
              { pos: mx + this.magnify(m.width), source },
            ],
            y: [
              { pos: my, source },
              { pos: my + this.magnify(m.height), source },
            ],
          };
        });

      return { x, y, modules };
    },
    snap_source_rects() {
      // modules another module snaps to, outlined like the guides
      const sources = this.guides.flatMap((g) => g.sources || []);
      return this.page_modules
        .filter((m) => sources.includes(m.$path))
        .map((m) => ({
          path: m.$path,
          x: this.magnify(m.x),
          y: this.magnify(m.y),
          width: this.magnify(m.width),
          height: this.magnify(m.height),
        }));
    },
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
  // the preview wrapper draws its own shadow, an inner one would scale with zoom
  ._singlePage.is--preview & {
    box-shadow: none;
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
._smartGuides {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10001;
  overflow: visible;
  pointer-events: none;

  line,
  rect {
    stroke: var(--c-rouge_clair);
    stroke-width: 2px;
    fill: none;
  }
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
