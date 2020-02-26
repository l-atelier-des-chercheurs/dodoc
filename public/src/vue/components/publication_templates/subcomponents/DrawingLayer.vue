<template>
  <div class="m_drawingLayer" :style="page_container_styles">
    <div class="m_drawingLayer--content" :style="page_styles">
      <canvas
        ref="canvas"
        :width="`${layer_options.width * pixelsPerMillimeters}px`"
        :height="`${layer_options.height * pixelsPerMillimeters}px`"
      />
      {{ media_meta }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    slugPubliName: String,
    pixelsPerMillimeters: Number,
    layer_options: Object,
    media_meta: Object,
    drawing_options: Object,
    zoom: Number
  },
  components: {},
  data() {
    return {
      canvas: undefined,
      new_line: undefined,
      isDown: false
    };
  },
  created() {},
  mounted() {
    loadScript("/libs/fabric.min.js").then(() => {
      document.addEventListener("keyup", this.captureKeyListener);

      this.$eventHub.$on("remove_selection", this.removeSelection);

      this.canvas = new fabric.Canvas(this.$refs.canvas, {
        enableRetinaScaling: false
      });

      if (!!this.media_meta.canvas_information)
        this.canvas.loadFromJSON(
          JSON.parse(this.media_meta.canvas_information)
        );

      this.setDrawingOptions();

      this.canvas.on("mouse:down", o => {
        this.isDown = true;
        var pointer = this.canvas.getPointer(o.e);
        var points = [pointer.x, pointer.y, pointer.x, pointer.y];

        if (!this.drawing_options.select_mode) {
          // this.new_line = new fabric.Line(points, {
          //   fill: this.drawing_options.color,
          //   stroke: this.drawing_options.color,
          //   strokeWidth: this.drawing_options.width,
          //   originX: "center",
          //   originY: "center"
          // });
          // this.canvas.add(this.new_line);
        }
      });
      this.canvas.on("mouse:move", o => {
        if (!this.isDown) return;
        var pointer = this.canvas.getPointer(o.e);

        if (!this.drawing_options.select_mode) {
          // this.new_line.set({ x2: pointer.x, y2: pointer.y });
          // this.new_line.setCoords();
          this.canvas.renderAll();
        }
      });

      this.canvas.on("mouse:up", o => {
        if (!this.isDown) return;

        this.isDown = false;
        if (!this.drawing_options.select_mode) {
          // this.new_line.setCoords();
          this.updateLinksList();
        }

        if (o.target) {
          this.updateLinksList();
        }
      });
    });
  },
  beforeDestroy() {
    this.$eventHub.$off("remove_selection", this.removeSelection);
    document.removeEventListener("keyup", this.captureKeyListener);
  },

  watch: {
    "media_meta.canvas_information": function() {
      this.canvas.loadFromJSON(JSON.parse(this.media_meta.canvas_information));
      this.setDrawingOptions();
    },
    drawing_options: {
      handler() {
        this.setDrawingOptions();
      },
      deep: true
    }
  },
  computed: {
    page_container_styles() {
      if (this.$root.state.mode === "print_publication") return;

      return `
        width: ${this.layer_options.width * this.zoom}mm;
        height: ${this.layer_options.height * this.zoom}mm;
      `;
    },
    page_styles() {
      if (this.$root.state.mode === "print_publication") {
        // reducing page height by 1mm is necessary to prevent blank pages in-between
        return `
          width: ${this.layer_options.width}mm;
          height: ${this.layer_options.height - 1}mm;
        `;
      } else {
        return `
          width: ${this.layer_options.width}mm;
          height: ${this.layer_options.height}mm;
          transform: scale(${this.zoom});
        `;
      }
    }
  },
  methods: {
    captureKeyListener(event) {
      if (this.drawing_options.select_mode && event.key === "Backspace") {
        this.removeSelection();
      }
    },
    setDrawingOptions() {
      this.canvas.selection = this.drawing_options.select_mode;
      this.canvas.forEachObject(o => {
        o.evented = this.drawing_options.select_mode;
      });
      if (!this.drawing_options.select_mode) {
        this.canvas.defaultCursor = "Handwriting";
        // this.canvas.defaultCursor = "crosshair";
      } else {
      }

      this.canvas.isDrawingMode = !this.drawing_options.select_mode;
      this.canvas.freeDrawingBrush.color = this.drawing_options.color;
      this.canvas.freeDrawingBrush.width = this.drawing_options.width;
    },
    removeSelection: function() {
      this.canvas.getActiveObjects().forEach(obj => {
        this.canvas.remove(obj);
      });
      this.canvas.discardActiveObject().renderAll();

      this.updateLinksList();
    },
    updateLinksList: function() {
      const canvas_information = JSON.stringify(this.canvas.toJSON());
      this.$root.editMedia({
        type: "projects",
        slugFolderName: this.slugPubliName,
        slugMediaName: this.media_meta.metaFileName,
        data: { canvas_information }
      });
    }
  }
};
</script>
<style></style>
