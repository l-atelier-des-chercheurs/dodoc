<template>
  <div class="m_mediaFreeDrawing">
    <svg
      ref="svgElement"
      :width="`${mediaSize.width}mm`"
      :height="`${mediaSize.height}mm`"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      @mousedown.stop.prevent="startPath('mouse', $event)"
      @touchstart.stop.prevent="startPath('touch', $event)"
      v-html="svgstr"
    ></svg>
  </div>
</template>
<script>
export default {
  props: {
    inline_edit_mode: Boolean,
    slugPubliName: String,
    media: Object,
    mediaSize: Object,
  },
  components: {},
  data() {
    return {
      svgstr: "",

      smoothing: 6,

      buffer: [],

      stroke_width: "2mm",

      last_mouse_pos: {
        x: undefined,
        y: undefined,
      },

      path: null,
      strPath: "",
    };
  },
  created() {},
  mounted() {
    try {
      const paths_string = document
        .createRange()
        .createContextualFragment(this.media.drawing_paths).firstChild
        .innerHTML;
      this.svgstr = paths_string;
    } catch (e) {}
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    startPath(type, event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`MediaFreeDrawing • METHODS : startPath`);

      this.path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );

      this.path.setAttribute("fill", "none");
      this.path.setAttribute("stroke", "#000");
      this.path.setAttribute("stroke-width", this.stroke_width);

      this.buffer = [];
      var pt = this.getMousePosition(event);
      this.appendToBuffer(pt);
      this.strPath = "M" + pt.x + " " + pt.y;
      this.path.setAttribute("d", this.strPath);
      this.$refs.svgElement.appendChild(this.path);

      if (type === "mouse") {
        window.addEventListener("mousemove", this.tracePath);
        window.addEventListener("mouseup", this.endPath);
      } else if (type === "touch") {
        window.addEventListener("touchmove", this.tracePath);
        window.addEventListener("touchend", this.endPath);
      }
    },

    tracePath(event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`MediaFreeDrawing • METHODS : tracePath`);
      if (this.path && event.target === this.$refs.svgElement) {
        this.appendToBuffer(this.getMousePosition(event));
        this.updateSvgPath();
      }
    },

    endPath(event) {
      if (this.path) {
        this.path = null;

        this.updateMedia();
      }

      event.stopPropagation();
      window.removeEventListener("mousemove", this.tracePath);
      window.removeEventListener("mouseup", this.endPath);
      window.removeEventListener("touchmove", this.tracePath);
      window.removeEventListener("touchend", this.endPath);
    },

    appendToBuffer(pt) {
      this.buffer.push(pt);
      while (this.buffer.length > this.smoothing) {
        this.buffer.shift();
      }
    },
    getAveragePoint(offset) {
      var len = this.buffer.length;
      if (len % 2 === 1 || len >= this.smoothing) {
        var totalX = 0;
        var totalY = 0;
        var pt, i;
        var count = 0;
        for (i = offset; i < len; i++) {
          count++;
          pt = this.buffer[i];
          totalX += pt.x;
          totalY += pt.y;
        }
        return {
          x: totalX / count,
          y: totalY / count,
        };
      }
      return null;
    },
    updateSvgPath() {
      var pt = this.getAveragePoint(0);

      if (pt) {
        // Get the smoothed part of the path that will not change
        this.strPath += " L" + pt.x + " " + pt.y;

        // Get the last part of the path (close to the current mouse position)
        // This part will change if the mouse moves again
        var tmpPath = "";
        for (var offset = 2; offset < this.buffer.length; offset += 2) {
          pt = this.getAveragePoint(offset);
          tmpPath += " L" + pt.x + " " + pt.y;
        }

        // Set the complete current path coordinates
        this.path.setAttribute("d", this.strPath + tmpPath);
      }
    },
    getMousePosition(event) {
      this.last_mouse_pos.x = event.offsetX;
      this.last_mouse_pos.y = event.offsetY;
      return {
        x: event.offsetX,
        y: event.offsetY,
      };
    },

    updateMedia() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`MediaFreeDrawing • METHODS : updateMedia`);

      const drawing_paths = this.$refs.svgElement.outerHTML;

      this.$root.editMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName: this.media.metaFileName,
        data: {
          drawing_paths,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
#svgElement {
  border: 1px solid;
  margin-top: 4px;
  margin-left: 4px;
  cursor: default;
}
#divSmoothingFactor {
  position: absolute;
  left: 14px;
  top: 12px;
}
.m_mediaFreeDrawing {
  position: relative;

  svg {
    stroke-width: 2mm;
  }
}
</style>
