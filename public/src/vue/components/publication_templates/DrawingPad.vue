<template>
  <div
    class="m_publicationview"
    :class="{ 'is--preview': preview_mode }"
    ref="panel"
  >
    <PublicationHeader
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias="layered_medias"
      @export="show_export_modal = true"
      @close="$root.closePublication"
    />

    <ExportPagePubli
      v-if="show_export_modal"
      :publication="publication"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
    />

    <PublicationDisplayButtons
      :preview_mode="preview_mode"
      :show_zoom_buttons="!contact_sheet_mode"
      :zoom="zoom"
      :zoom_min="zoom_min"
      :zoom_max="zoom_max"
      @togglePreviewMode="$emit('togglePreviewMode')"
      @setZoom="(val) => (zoom = val)"
    />

    <LayerPanel
      v-if="
        ![
          'export_publication',
          'print_publication',
          'link_publication',
        ].includes($root.state.mode) && !preview_mode
      "
      :layers="layers"
      :layered_medias="layered_medias"
      :publication="publication"
      :slugPubliName="slugPubliName"
    />

    <div class="m_drawingPad" ref="current_page">
      <div class="m_drawingPad--content" :style="pad_size">
        <div
          :key="'background'"
          class="m_drawingPad--layer m_drawingPad--layer_background"
        >
          <div class="">
            <div
              class="m_drawingPad--layer--backgroundContainer"
              :style="setPageContainerProperties(publication)"
            >
              <div
                class="m_drawingPad--layer--backgroundContainer--background"
                :style="setPageProperties(publication)"
              />
            </div>
          </div>
        </div>

        <div
          v-for="layer in layers"
          :key="layer.id"
          class="m_drawingPad--layer"
          :class="[
            {
              'is--inactive':
                !!$root.settings.current_publication.layer_id &&
                layer.id !== $root.settings.current_publication.layer_id &&
                !preview_mode,
              'is--edited':
                layer.id === $root.settings.current_publication.layer_id &&
                !preview_mode,
            },
            'm_drawingPad--layer_' + layer.type,
          ]"
        >
          <PagePublicationSinglePage
            v-if="layer.type === 'medias'"
            :mode="'single'"
            :preview_mode="
              preview_mode ||
              (layer.id !== $root.settings.current_publication.layer_id &&
                !preview_mode)
            "
            :slugPubliName="slugPubliName"
            :page="layerOptions(layer)"
            :publication_medias="layered_medias[layer.id]"
            :read_only="read_only"
            :pixelsPerMillimeters="pixelsPerMillimeters"
            :zoom="zoom"
            @editPubliMedia="$emit('editPubliMedia', $event)"
          />

          <DrawingLayer
            v-else-if="
              layer.type === 'drawing' &&
              getDrawingLayerReferenceMedia(layer.id)
            "
            :key="layer.id"
            :slugPubliName="slugPubliName"
            :pixelsPerMillimeters="pixelsPerMillimeters"
            :layer_options="layerOptions(layer)"
            :is_active="
              $root.settings.current_publication.layer_id &&
              layer.id === $root.settings.current_publication.layer_id
            "
            :media="getDrawingLayerReferenceMedia(layer.id)"
            :zoom="zoom"
          />
        </div>
      </div>
    </div>
    <div
      ref="mmMeasurer"
      style="height: 10mm; width: 10mm; left: 100%; position: fixed; top: 100%"
    />
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import PublicationDisplayButtons from "../subcomponents/PublicationDisplayButtons.vue";
import ExportPagePubli from "../modals/ExportPagePubli.vue";
import DrawingLayer from "./subcomponents/DrawingLayer.vue";
import PagePublicationSinglePage from "./PagePublicationSinglePage.vue";
import LayerPanel from "./subcomponents/LayerPanel.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    layered_medias: Object,
    read_only: Boolean,
    preview_mode: Boolean,
    fullscreen_mode: Boolean,
    can_edit_publi: Boolean,
    can_see_publi: Boolean,
  },
  components: {
    PublicationHeader,
    PublicationDisplayButtons,
    ExportPagePubli,
    DrawingLayer,
    PagePublicationSinglePage,
    LayerPanel,
  },
  data() {
    return {
      show_export_modal: false,
      accepted_media_type: ["audio", "video"],
      zoom: 1,
      zoom_min: 0.2,
      zoom_max: 2,

      pixelsPerMillimeters: 0,
    };
  },
  created() {
    this.$root.setPublicationZoom(this.zoom);

    document.getElementsByTagName("body")[0].style = `
      --page-width: ${this.publication.width}mm;
      --page-height: ${this.publication.height}mm
    `;
  },
  mounted() {
    this.pixelsPerMillimeters = this.$refs.hasOwnProperty("mmMeasurer")
      ? this.$refs.mmMeasurer.offsetWidth / 10
      : 3.8;

    if (
      !["export_publication", "print_publication", "link_publication"].includes(
        this.$root.state.mode
      )
    ) {
      this.$nextTick(() => {
        this.updatePageSizeAccordingToPanel();
        this.$eventHub.$on(
          "activity_panels_resized",
          this.updatePageSizeAccordingToPanel
        );
      });
    }

    this.$eventHub.$on("publication.addMedia", this.addMedia);

    this.$eventHub.$off(
      "activity_panels_resized",
      this.updatePageSizeAccordingToPanel
    );
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.addMedia", this.addMedia);
  },
  watch: {
    zoom: function () {
      if (this.$root.state.dev_mode === "debug")
        console.log(`WATCH • Publication: zoom`);

      this.zoom = Math.min(this.zoom_max, Math.max(this.zoom_min, this.zoom));
      this.$root.setPublicationZoom(this.zoom);
    },
    "$root.settings.publi_zoom": function () {
      if (this.$root.state.dev_mode === "debug")
        console.log(`WATCH • Publication: $root.settings.publi_zoom`);

      this.zoom = this.$root.settings.publi_zoom;
    },
  },
  computed: {
    can_edit_publi() {
      return this.$root.canEditFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
    layers() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`COMPUTED • layers`);
      }

      if (
        !this.publication.hasOwnProperty("layers") ||
        this.publication.layers.length === 0
      ) {
        return [];
      }

      return this.publication.layers;
    },
    pad_size() {
      if (
        [
          "export_publication",
          "print_publication",
          "link_publication",
        ].includes(this.$root.state.mode)
      ) {
        return `width: ${this.publication.width}mm; height: ${this.publication.height}mm;`;
      }
    },
  },
  methods: {
    addMedia({ values = {} }) {
      return new Promise((resolve, reject) => {
        if (this.$root.state.dev_mode === "debug")
          console.log(`DrawingPad • METHODS: addMedia`);

        const current_layer_id = this.$root.settings.current_publication
          .layer_id;

        if (!current_layer_id) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.missing_layer_id"));
        }

        values.layer_id = current_layer_id;

        values.x = 0;
        values.y = 0;

        values.z_index =
          this.getHighestZNumberAmongstMedias(
            this.layered_medias[current_layer_id]
          ) + 1;

        // get current scroll
        if (this.$refs.current_page) {
          const posx_in_cm =
            this.$refs.current_page.scrollLeft / this.pixelsPerMillimeters;
          if (!Number.isNaN(posx_in_cm)) values.x = posx_in_cm;

          const posy_in_cm =
            this.$refs.current_page.scrollTop / this.pixelsPerMillimeters;
          if (!Number.isNaN(posy_in_cm)) values.y = posy_in_cm;
        }

        this.$emit("addMedia", { values });
      });
    },
    layerOptions(layer) {
      return {
        margin_left: 0,
        margin_right: 0,
        margin_top: 0,
        margin_bottom: 0,
        snap_to_grid: false,
        width: this.publication.width,
        height: this.publication.height,
        color: layer.color,
        // gridstep: 50
      };
    },

    getHighestZNumberAmongstMedias(page_medias) {
      if (!page_medias) return 0;

      const medias_with_z = page_medias
        .filter((m) => m.hasOwnProperty("z_index"))
        .map((m) => {
          return m.z_index;
        });

      if (medias_with_z.length === 0) return 0;

      return Math.max(...medias_with_z);
    },

    updatePageSizeAccordingToPanel() {
      if (!this.$refs.panel) return;
      const panel_width = this.$refs.panel.offsetWidth;
      const current_page_el = this.$refs.current_page;

      if (current_page_el && panel_width > 0) {
        const page = current_page_el.querySelector(
          ".m_drawingPad--layer--backgroundContainer--background"
        );
        const margins = 150;
        // if (page && panel_width < page.offsetWidth + margins) {
        this.zoom = panel_width / (page.offsetWidth + margins);
        // }
      }
    },

    getDrawingLayerReferenceMedia(id) {
      const reference_media = Object.values(this.publication.medias).find(
        (m) => m.layer_id === id
      );
      if (reference_media) return reference_media;
      return false;
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
  },
};
</script>
<style></style>
