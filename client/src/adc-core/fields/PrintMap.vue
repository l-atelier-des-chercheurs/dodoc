<template>
  <BaseModal2 :title="$t('print_map')" @close="$emit('close')">
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
      {{ print_only_basemap }}
    </div>
    <fieldset class="u-spacingBottom _previewCanvas">
      <legend class="u-label">{{ $t("preview") }}</legend>
      <canvas ref="pageCanvas" class="" />
    </fieldset>
    <button
      type="button"
      class="u-button u-button_bleuvert"
      :disabled="is_making_print"
      @click="printMap()"
    >
      <b-icon class="inlineSVG" icon="printer" />
      {{ $t("export_pdf") }}
    </button>
  </BaseModal2>
</template>
<script>
import { jsPDF } from "jspdf";

export default {
  props: {
    map: Object,
  },
  components: {},
  data() {
    return {
      is_making_print: false,

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
  i18n: {
    messages: {
      fr: {
        print_map: "Imprimer la carte",
        print_only_basemap:
          "Uniquement le fond de carte (masquer les épingles et les dessins)",
      },
    },
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.generatePreview();
    });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    generatePreview() {
      // from https://openlayers.org/en/latest/examples/export-pdf.html
      this.is_making_print = true;
      const format = this.print_format;
      const dim = this.print_formats.find((f) => f.key === format).dimensions;
      // const resolution = 300; // DPI
      const map = this.map;

      // const paper_width = Math.round((dim[0] * resolution) / 25.4);
      // const paper_height = Math.round((dim[1] * resolution) / 25.4);

      const [current_map_width, current_map_height] = map.getSize();
      let orientation, paper_width, paper_height;
      if (current_map_width <= current_map_height) {
        orientation = "portrait";
        paper_width = dim[1];
        paper_height = dim[0];
      } else {
        orientation = "landscape";
        paper_width = dim[0];
        paper_height = dim[1];
      }
      const viewResolution = map.getView().getResolution();

      var hRatio = paper_width / current_map_width;
      var vRatio = paper_height / current_map_height;
      var ratio = Math.min(hRatio, vRatio);

      var centerShift_x = (paper_width - current_map_width * ratio) / 2;
      var centerShift_y = (paper_height - current_map_height * ratio) / 2;

      map.once("rendercomplete", () => {
        const mapCanvas = document.createElement("canvas");
        mapCanvas.width = current_map_width / ratio;
        mapCanvas.height = current_map_height / ratio;
        const mapContext = mapCanvas.getContext("2d");
        mapContext.fillStyle = "green";
        mapContext.fillRect(0, 0, mapCanvas.width, mapCanvas.height);

        Array.prototype.forEach.call(
          document.querySelectorAll(".ol-layer"),
          async (layer) => {
            if (this.print_only_basemap)
              if (!layer.className?.includes("ol-basemap")) return;

            const canvas = layer.querySelector("canvas");
            if (canvas.width > 0) {
              const opacity = canvas.parentNode.style.opacity;
              mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
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
        page_context.drawImage(
          mapCanvas,
          centerShift_x,
          centerShift_y,
          current_map_width * ratio,
          current_map_height * ratio
        );

        // setTimeout(() => {
        //   const pdf = new jsPDF({
        //     orientation,
        //     unit: "mm",
        //     format,
        //   });

        //   pdf.addImage(
        //     mapCanvas.toDataURL("image/jpeg"),
        //     "JPEG",
        //     centerShift_x,
        //     centerShift_y,
        //     current_map_width * ratio,
        //     current_map_height * ratio
        //   );
        //   pdf.save("map.pdf");
        // }, 2000);

        // Reset original map size

        map.setSize([current_map_width, current_map_height]);
        map.getView().setResolution(viewResolution);
        this.is_making_print = false;
      });

      map.setSize([current_map_width / ratio, current_map_height / ratio]);
      map.getView().setResolution(viewResolution * ratio);
    },
    printMap() {},
  },
};
</script>
<style lang="scss" scoped>
._previewCanvas canvas {
  height: 200px;
  width: auto;
  display: block;
  margin: 0 auto;
  border: 2px solid var(--c-gris);
  padding: 2px;
}
</style>
