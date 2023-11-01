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
    <button
      type="button"
      class="u-button u-button_bleuvert"
      :disabled="is_making_print"
      @click="startPrint()"
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
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    startPrint() {
      // from https://openlayers.org/en/latest/examples/export-pdf.html
      this.is_making_print = true;
      const format = this.print_format;
      const dim = this.print_formats.find((f) => f.key === format).dimensions;
      const resolution = 300; // DPI
      const map = this.map;

      // const paper_width = Math.round((dim[0] * resolution) / 25.4);
      // const paper_height = Math.round((dim[1] * resolution) / 25.4);
      const paper_width = Math.round((dim[0] * resolution) / 25.4);
      const paper_height = Math.round((dim[1] * resolution) / 25.4);
      const [current_map_width, current_map_height] = map.getSize();

      const viewResolution = map.getView().getResolution();

      var hRatio = paper_width / current_map_width;
      var vRatio = paper_height / current_map_height;
      var ratio = Math.min(hRatio, vRatio);
      var centerShift_x = (paper_width - current_map_width * ratio) / 2;
      var centerShift_y = (paper_height - current_map_height * ratio) / 2;

      map.once("rendercomplete", () => {
        const mapCanvas = document.createElement("canvas");
        mapCanvas.width = paper_width;
        mapCanvas.height = paper_height;
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

        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format,
        });

        debugger;

        // pdf.addImage(
        //   mapCanvas.toDataURL("image/jpeg"),
        //   "JPEG",
        //   centerShift_x,
        //   centerShift_y,
        //   current_map_width * ratio,
        //   current_map_width * ratio
        // );
        pdf.addImage(
          mapCanvas.toDataURL("image/jpeg"),
          "JPEG",
          0,
          0,
          dim[0],
          dim[1]
        );

        pdf.save("map.pdf");
        // Reset original map size
        map.setSize([current_map_width, current_map_height]);
        map.getView().setResolution(viewResolution);

        this.is_making_print = false;
      });
      // set map size while respecting ratio
      // const map_ratio = current_map_height / current_map_width;
      // const printSize = [paper_width, paper_width * map_ratio];

      // map.setSize([current_map_width * ratio, current_map_height * ratio]);
      // map.setSize(printSize);
      // const scaling = Math.min(
      //   paper_width / current_map_width,
      //   paper_height / current_map_height
      // );
      map.getView().setResolution(viewResolution);
    },
  },
};
</script>
<style lang="scss" scoped></style>
