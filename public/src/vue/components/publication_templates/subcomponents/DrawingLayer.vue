<template>
  <div
    class="m_drawingLayer"
    :style="setPageContainerProperties(layer_options)"
  >
    <div
      class="m_drawingLayer--content"
      :style="setPageProperties(layer_options)"
    >
      <canvas
        ref="canvas"
        v-if="layer_options.width * pixelsPerMillimeters > 0"
        :width="`${layer_options.width * pixelsPerMillimeters}px`"
        :height="`${layer_options.height * pixelsPerMillimeters}px`"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    slugPubliName: String,
    pixelsPerMillimeters: Number,
    layer_options: Object,
    media: Object,
    is_active: Boolean,
    zoom: Number,
  },
  components: {},
  data() {
    return {
      canvas: undefined,
      new_line: undefined,
      isDown: false,

      drawing_options: {
        mode: "drawing",
        width: 4,
        color: "#000000",
      },
    };
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.startCanvas();
    });

    this.$eventHub.$on("updateDrawingOptions", this.updateDrawingOptions);
  },
  beforeDestroy() {
    this.$eventHub.$off("remove_selection", this.removeSelection);
    document.removeEventListener("keyup", this.captureKeyListener);
  },

  watch: {
    "media.canvas_information": function () {
      if (this.$root.state.dev_mode === "debug")
        console.log(`WATCH • DrawingLayer: media.canvas_information`);

      if (!this.canvas) return false;

      this.canvas.loadFromJSON(JSON.parse(this.media.canvas_information));
      // this.setDrawingOptions();
    },
    layer_options: {
      handler() {
        if (this.$root.state.dev_mode === "debug")
          console.log(`WATCH • DrawingLayer: layer_options`);

        if (!this.canvas) return false;

        // this.canvas
        //   .getObjects()
        //   .map(o => o.set("stroke", this.layer_options.color));
        this.canvas.renderAll();
        this.setDrawingOptions();
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    updateDrawingOptions(val) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • DrawingLayer: updateDrawingOptions`);

      Object.assign(this.drawing_options, val);

      if (!this.canvas) return false;
      this.setDrawingOptions();
    },
    setPageContainerProperties(page) {
      if (this.$root.state.mode === "print_publication") return;

      let css = `
        transform: scale(${this.zoom});
        transform-origin: left top;
      `;

      return (css += `
          width: ${page.width}mm;
          height: ${page.height}mm;
          margin: 40px;
          padding: 40px ${140 / this.zoom}px ${100 * this.zoom}px ${
        240 / this.zoom
      }px;  
          box-sizing: content-box;
        `);
    },
    setPageProperties(page) {
      if (this.$root.state.mode === "print_publication") {
        // reducing page height by 1mm is necessary to prevent blank pages in-between
        return `
          width: ${page.width}mm;
          height: ${page.height - 1}mm;
        `;
      } else {
        return `
          width: ${page.width}mm;
          height: ${page.height}mm;
        `;
      }
    },
    startCanvas() {
      if (!this.$refs.canvas) {
        // this.$alertify
        //   .closeLogOnClick(true)
        //   .delay(4000)
        //   .error(
        //     "canvas does not exist yet… will attempt to start again in 1 second"
        //   );
        setTimeout(() => {
          this.startCanvas();
        }, 1000);
        return;
      }

      const path_to_fabric =
        this.$root.state.mode === "export_publication"
          ? "./_libs/fabric.min.js"
          : "/libs/fabric.min.js";

      this.$loadScript(path_to_fabric)
        .then(
          () =>
            new Promise((resolve) => {
              // <== create a promise here
              setTimeout(function () {
                resolve(); // <== resolve it in callback
              }, 500);
            })
        )
        .then(() => {
          document.addEventListener("keyup", this.captureKeyListener);

          this.$eventHub.$on("remove_selection", this.removeSelection);

          this.canvas = new fabric.Canvas(this.$refs.canvas, {
            enableRetinaScaling: true,
          });

          if (
            this.media.hasOwnProperty("canvas_information") &&
            this.media.canvas_information !== ""
          ) {
            this.canvas.loadFromJSON(JSON.parse(this.media.canvas_information));
          }

          this.setDrawingOptions();

          this.canvas.on("mouse:down", (o) => {
            this.isDown = true;
            var pointer = this.canvas.getPointer(o.e);
            var points = [pointer.x, pointer.y, pointer.x, pointer.y];
          });
          this.canvas.on("mouse:move", (o) => {
            if (!this.isDown) return;
            var pointer = this.canvas.getPointer(o.e);

            if (this.drawing_options.mode === "drawing") {
              // this.new_line.set({ x2: pointer.x, y2: pointer.y });
              // this.new_line.setCoords();
              this.canvas.renderAll();
            }
          });

          this.canvas.on("mouse:up", (o) => {
            if (!this.isDown) return;
            this.isDown = false;

            if (this.drawing_options.mode === "drawing") this.updateLinksList();
            if (o.target) this.updateLinksList();
          });
        });
    },
    captureKeyListener(event) {
      if (
        this.is_active &&
        this.drawing_options.mode === "select" &&
        (event.key === "Backspace" || event.key === "Delete")
      ) {
        this.removeSelection();
        event.stopPropagation();
      }
    },
    setDrawingOptions() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • DrawingLayer: setDrawingOptions`);

      this.canvas.selection = this.drawing_options.mode === "select";

      this.canvas.forEachObject((o) => {
        o.evented = this.drawing_options.mode === "select";
      });
      if (this.drawing_options.mode === "drawing") {
        this.canvas.defaultCursor = "Handwriting";
        // this.canvas.defaultCursor = "crosshair";
      } else {
      }

      this.canvas.isDrawingMode = this.drawing_options.mode === "drawing";
      this.canvas.freeDrawingBrush.width = this.drawing_options.width;
      this.canvas.freeDrawingBrush.color = this.drawing_options.color;

      // this.$nextTick(() => {
      //   this.updateLinksList();
      // });
    },
    removeSelection: function () {
      this.canvas.getActiveObjects().forEach((obj) => {
        this.canvas.remove(obj);
      });
      this.canvas.discardActiveObject().renderAll();

      this.updateLinksList();
    },
    updateLinksList: function () {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • DrawingLayer: updateLinksList`);

      if (
        [
          "export_publication",
          "print_publication",
          "link_publication",
        ].includes(this.$root.state.mode)
      ) {
        return;
      }

      const canvas_information = JSON.stringify(this.canvas.toJSON());
      this.$root.editMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName: this.media.metaFileName,
        data: { canvas_information },
      });
    },
  },
};
</script>
<style></style>
