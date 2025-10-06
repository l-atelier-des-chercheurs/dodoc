<template>
  <BaseModal2 :title="$t('print_map')" @close="$emit('close')">
    <LoaderSpinner v-if="is_making_preview" />
    <div class="u-spacingBottom">
      <DLabel :str="$t('format')" />
      <select v-model="print_format">
        <option
          v-for="format in print_formats"
          :key="format.key"
          :value="format.key"
          v-text="format.key"
        />
      </select>
    </div>
    <div class="u-spacingBottom">
      <ToggleInput
        :content="print_only_basemap"
        :label="$t('print_only_basemap')"
        @update:content="print_only_basemap = $event"
      />
    </div>
    <fieldset class="u-spacingBottom _previewCanvas">
      <legend class="u-label">{{ $t("preview") }}</legend>
      <canvas v-show="false" ref="mapCanvas" class="" />
      <canvas ref="pageCanvas" class="" />
    </fieldset>
    <template #footer>
      <button type="button" class="u-button" @click="$emit('close')">
        <b-icon icon="x-circle" />
        {{ $t("cancel") }}
      </button>

      <button
        type="button"
        class="u-button u-button_bleuvert"
        :disabled="is_making_print"
        @click="printMap()"
      >
        <b-icon class="inlineSVG" icon="printer" />
        {{ $t("export_in_pdf") }}
      </button></template
    >
  </BaseModal2>
</template>
<script>
import { jsPDF } from "jspdf";

export default {
  props: {
    map: Object,
    map_baselayer_bw: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      is_making_preview: false,
      is_making_print: false,
      print_options: {},

      print_format: "A4",
      print_formats: [
        {
          key: "A0",
          dimensions: [1189, 841],
        },
        {
          key: "A1",
          dimensions: [841, 594],
        },
        {
          key: "A2",
          dimensions: [594, 420],
        },
        {
          key: "A3",
          dimensions: [420, 297],
        },
        {
          key: "A4",
          dimensions: [297, 210],
        },
        {
          key: "A5",
          dimensions: [210, 148],
        },
      ],

      print_only_basemap: true,
    };
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.generatePreview();
    });
  },
  beforeDestroy() {},
  watch: {
    print_only_basemap() {
      this.generatePreview();
    },
    print_format() {
      this.generatePreview();
    },
  },
  computed: {},
  methods: {
    async generatePreview() {
      // from https://openlayers.org/en/latest/examples/export-pdf.html
      this.is_making_preview = true;

      await new Promise((r) => setTimeout(r, 500));

      const format = this.print_format;
      const dim = this.print_formats.find((f) => f.key === format).dimensions;
      const resolution = 300; // DPI
      const map = this.map;

      const [current_map_width, current_map_height] = map.getSize();
      let orientation, paper_width_in_mm, paper_height_in_mm;
      if (current_map_width <= current_map_height) {
        orientation = "portrait";
        paper_width_in_mm = dim[1];
        paper_height_in_mm = dim[0];
      } else {
        orientation = "landscape";
        paper_width_in_mm = dim[0];
        paper_height_in_mm = dim[1];
      }
      const paper_width = Math.round((paper_width_in_mm * resolution) / 25.4);
      const paper_height = Math.round((paper_height_in_mm * resolution) / 25.4);
      const viewResolution = map.getView().getResolution();

      var hRatio = paper_width / current_map_width;
      var vRatio = paper_height / current_map_height;
      var ratio = Math.min(hRatio, vRatio);

      const new_map_width = current_map_width * ratio;
      const new_map_height = current_map_height * ratio;

      var centerShift_x = (paper_width - new_map_width) / 2;
      var centerShift_y = (paper_height - new_map_height) / 2;

      map.once("rendercomplete", () => {
        const mapCanvas = this.$refs.mapCanvas;
        mapCanvas.width = new_map_width;
        mapCanvas.height = new_map_height;
        const mapContext = mapCanvas.getContext("2d");

        Array.prototype.forEach.call(
          document.querySelectorAll(".ol-layer"),
          async (layer) => {
            if (this.print_only_basemap)
              if (!layer.className?.includes("ol-basemap")) return;

            const canvas = layer.querySelector("canvas");
            if (canvas.width > 0) {
              const opacity = canvas.parentNode.style.opacity;
              mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
              // Draw the layer as usual
              mapContext.drawImage(canvas, 0, 0);

              const transform = canvas.style.transform;
              // Get the transform parameters from the style's transform matrix
              const matrix = transform
                // eslint-disable-next-line
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(",")
                .map(Number);
              // Apply the transform to the export map context
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContext,
                matrix
              );
              mapContext.drawImage(canvas, 0, 0);
            }
          }
        );
        mapContext.globalAlpha = 1;
        mapContext.setTransform(1, 0, 0, 1, 0, 0);

        const page_canvas = this.$refs.pageCanvas;
        page_canvas.width = paper_width;
        page_canvas.height = paper_height;
        const page_context = page_canvas.getContext("2d");
        page_context.fillStyle = "white";
        page_context.fillRect(0, 0, page_canvas.width, page_canvas.height);

        page_context.drawImage(
          mapCanvas,
          centerShift_x,
          centerShift_y,
          new_map_width,
          new_map_height
        );

        // Apply grayscale filter if map_baselayer_bw is true
        if (this.map_baselayer_bw) {
          const imageData = page_context.getImageData(
            0,
            0,
            page_canvas.width,
            page_canvas.height
          );
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const gray =
              data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray; // Red
            data[i + 1] = gray; // Green
            data[i + 2] = gray; // Blue
            // Alpha channel (data[i + 3]) remains unchanged
          }

          page_context.putImageData(imageData, 0, 0);
        }

        this.print_options = {
          orientation,
          format,
          paper_width_in_mm,
          paper_height_in_mm,
          page_canvas,
        };

        // Reset original map size
        map.setSize([current_map_width, current_map_height]);
        map.getView().setResolution(viewResolution);
        this.is_making_preview = false;
      });

      // ratio = 0.5;
      // map.setSize([current_map_width * ratio, current_map_height * ratio]);
      // map.getView().setResolution(viewResolution * ratio);

      const printSize = [new_map_width, new_map_height];
      map.setSize(printSize);
      const scaling = Math.min(
        paper_width / current_map_width,
        paper_height / current_map_height
      );
      map.getView().setResolution(viewResolution / scaling);
    },

    printMap() {
      this.is_making_print = true;

      const {
        orientation,
        format,
        paper_width_in_mm,
        paper_height_in_mm,
        page_canvas,
      } = this.print_options;

      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format,
      });

      pdf.addImage(
        page_canvas.toDataURL("image/jpeg"),
        "JPEG",
        0,
        0,
        paper_width_in_mm,
        paper_height_in_mm
      );
      pdf.save("map.pdf");

      this.is_making_print = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._previewCanvas {
  text-align: center;
  canvas {
    height: 200px;
    width: auto;
    display: inline-blockk;
    margin: 0 auto;
    border: 2px solid var(--c-gris);
    // padding: 2px;
  }
}
</style>
