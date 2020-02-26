<template>
  <div class="m_publicationview" :class="{ 'is--preview': preview_mode }" ref="panel">
    <PublicationHeader
      :slugPubliName="slugPubliName"
      :publication="publication"
      :publication_medias="publication_medias"
      @export="show_export_modal = true"
    />
    <div
      class="m_publicationSettings"
      v-if="
        ![
          'export_publication',
          'print_publication',
          'link_publication'
        ].includes($root.state.mode)
      "
    >
      <button
        class="margin-vert-verysmall font-verysmall"
        :class="{ 'is--active': !preview_mode }"
        @mousedown.stop.prevent="preview_mode = !preview_mode"
        @touchstart.stop.prevent="preview_mode = !preview_mode"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="144px"
          height="84px"
          viewBox="0 0 144 84"
          style="enable-background:new 0 0 144 84;"
          xml:space="preserve"
        >
          <defs />
          <g>
            <path
              d="M72,0C32.2,0,0,42,0,42s32.2,42,72,42s72-42,72-42S111.8,0,72,0z M72,71.3c-16.5,0-30-13.2-30-29.6
            c0-16.3,13.4-29.6,30-29.6c16.5,0,30,13.3,30,29.6C102,58,88.5,71.3,72,71.3z"
            />
          </g>
        </svg>
      </button>
      <button
        class="margin-vert-verysmall font-verysmall"
        @mousedown.stop.prevent="toggleFullscreen"
        @touchstart.stop.prevent="toggleFullscreen"
      >
        <svg
          version="1.1"
          v-if="!fullscreen_mode"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="133.3px"
          height="133.2px"
          viewBox="0 0 133.3 133.2"
          style="enable-background:new 0 0 133.3 133.2;"
          xml:space="preserve"
        >
          <polygon class="st0" points="58.7,112.2 58.7,133.2 0,133.2 0,74.5 21,74.5 21,112.2 	" />
          <polygon
            class="st0"
            points="112.3,74.5 133.3,74.5 133.3,133.2 74.6,133.2 74.6,112.2 112.3,112.2 	"
          />
          <polygon class="st0" points="21,58.7 0,58.7 0,0 58.7,0 58.7,21 21,21 	" />
          <polygon class="st0" points="133.3,58.7 112.3,58.7 112.3,21 74.6,21 74.6,0 133.3,0 	" />
        </svg>
        <svg
          version="1.1"
          v-if="fullscreen_mode"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="133.3px"
          height="133.2px"
          viewBox="0 0 133.3 133.2"
          style="enable-background:new 0 0 133.3 133.2;"
          xml:space="preserve"
        >
          <polygon class="st0" points="0,95.5 0,74.5 58.7,74.5 58.7,133.2 37.7,133.2 37.7,95.5 	" />
          <polygon
            class="st0"
            points="95.6,133.2 74.6,133.2 74.6,74.5 133.3,74.5 133.3,95.5 95.6,95.5 	"
          />
          <polygon class="st0" points="37.7,0 58.7,0 58.7,58.7 0,58.7 0,37.7 37.7,37.7 	" />
          <polygon class="st0" points="74.6,0 95.6,0 95.6,37.7 133.3,37.7 133.3,58.7 74.6,58.7 	" />
        </svg>
      </button>
      <button
        v-if="!contact_sheet_mode"
        class="margin-vert-verysmall font-verysmall"
        :disabled="zoom === zoom_max"
        @mousedown.stop.prevent="zoom += 0.1"
        @touchstart.stop.prevent="zoom += 0.1"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="182.5px"
          height="188.1px"
          viewBox="0 0 182.5 188.1"
          style="enable-background:new 0 0 182.5 188.1;"
          xml:space="preserve"
        >
          <defs />
          <path d="M102.6,0v83.1h79.9v21.2h-79.9v83.8H79.9v-83.8H0V83.1h79.9V0H102.6z" />
        </svg>
      </button>
      <button
        v-if="!contact_sheet_mode"
        class="margin-vert-verysmall font-verysmall"
        :disabled="zoom === zoom_min"
        @mousedown.stop.prevent="zoom -= 0.1"
        @touchstart.stop.prevent="zoom -= 0.1"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="155.6px"
          height="21.2px"
          viewBox="0 0 155.6 21.2"
          style="enable-background:new 0 0 155.6 21.2;"
          xml:space="preserve"
        >
          <defs />
          <path d="M155.6,0v21.2H0V0H155.6z" />
        </svg>
      </button>
    </div>

    <LayerPanel
      :layers="layers"
      :publication="publication"
      :slugPubliName="slugPubliName"
      :publication_medias="publication_medias"
    />

    <div class="m_drawingPad" ref="current_page">
      <div :key="'background'" class="m_drawingPad--layer m_drawingPad--layer_background">
        <div
          class="m_drawingPad--layer--backgroundContainer"
          :style="
            `width: ${layer_options.width *
              zoom}mm; height: ${layer_options.height * zoom}mm;`
          "
        >
          <div
            class="m_drawingPad--layer--backgroundContainer--background"
            :style="
              `width: ${layer_options.width}mm; height: ${layer_options.height}mm; transform: scale(${zoom});`
            "
          />
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
              layer.id !== $root.settings.current_publication.layer_id
          },
          'm_drawingPad--layer_' + layer.type
        ]"
      >
        <PagePublicationSinglePage
          v-if="layer.type === 'medias'"
          :mode="'drawingpad'"
          :preview_mode="false"
          :slugPubliName="slugPubliName"
          :page="layer_options"
          :publication_medias="publication_medias[layer.id]"
          :read_only="read_only"
          :pixelsPerMillimeters="pixelsPerMillimeters"
          :zoom="zoom"
        />

        <DrawingLayer
          v-else-if="layer.type === 'drawing' && getDrawingLayerReferenceMedia(layer.id)"
          :key="layer.id"
          :slugPubliName="slugPubliName"
          :pixelsPerMillimeters="pixelsPerMillimeters"
          :layer_options="layer_options"
          :media_meta="getDrawingLayerReferenceMedia(layer.id)"
          :drawing_options="drawing_options"
          :zoom="zoom"
        />
      </div>
    </div>
    <div
      ref="mmMeasurer"
      style="height: 10mm; width: 10mm; left: 100%; position: fixed; top: 100%;"
    />
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import DrawingLayer from "./subcomponents/DrawingLayer.vue";
import PagePublicationSinglePage from "./PagePublicationSinglePage.vue";
import LayerPanel from "./subcomponents/LayerPanel.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    read_only: Boolean
  },
  components: {
    PublicationHeader,
    DrawingLayer,
    PagePublicationSinglePage,
    LayerPanel
  },
  data() {
    return {
      show_export_modal: false,
      publication_medias: {},
      accepted_media_type: ["audio", "video"],

      preview_mode: this.$root.state.mode !== "live",
      fullscreen_mode: false,
      zoom: 1,
      zoom_min: 0.2,
      zoom_max: 2,

      drawing_options: {
        width: 4,
        select_mode: false,
        color: "#000"
      },

      pixelsPerMillimeters: 0
    };
  },
  created() {
    this.$root.setPublicationZoom(this.zoom);
  },
  mounted() {
    this.pixelsPerMillimeters = this.$refs.hasOwnProperty("mmMeasurer")
      ? this.$refs.mmMeasurer.offsetWidth / 10
      : 3.8;

    this.$nextTick(() => {
      this.updatePageSizeAccordingToPanel();
      this.$eventHub.$on(
        "activity_panels_resized",
        this.updatePageSizeAccordingToPanel
      );
    });

    this.$eventHub.$on("publication.addMedia", this.addMedia);
    this.$eventHub.$on(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );

    this.$eventHub.$off(
      "activity_panels_resized",
      this.updatePageSizeAccordingToPanel
    );

    this.updateMediasPubli();
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.addMedia", this.addMedia);
    this.$eventHub.$off(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );
  },
  watch: {
    "publication.medias": function() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`WATCH • Publication: publication.medias`);
      }
      this.updateMediasPubli();
    },
    "$root.store.projects": {
      handler() {
        if (this.$root.state.dev_mode === "debug") {
          console.log(`WATCH • Publication: $root.store.projects`);
        }
        this.updateMediasPubli();
      },
      deep: true
    },
    zoom: function() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`WATCH • Publication: zoom`);

      this.zoom = Math.min(this.zoom_max, Math.max(this.zoom_min, this.zoom));
      this.$root.setPublicationZoom(this.zoom);
    },
    "$root.settings.publi_zoom": function() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`WATCH • Publication: $root.settings.publi_zoom`);

      this.zoom = this.$root.settings.publi_zoom;
    }
  },
  computed: {
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

    layer_options() {
      return {
        margin_left: 0,
        margin_right: 0,
        margin_top: 0,
        margin_bottom: 0,
        width: this.publication.width,
        height: this.publication.height
        // gridstep: 50
      };
    }
  },
  methods: {
    addMedia({ slugProjectName, metaFileName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • DrawingPad: addMedia with
        slugProjectName = ${slugProjectName} and metaFileName = ${metaFileName}`);
      }

      const layer_id = this.$root.settings.current_publication.layer_id;

      const x = 0;
      const y = 0;

      const z_index =
        this.getHighestZNumberAmongstMedias(this.publication_medias[layer_id]) +
        1;

      this.$root.createMedia({
        slugFolderName: this.slugPubliName,
        type: "publications",
        additionalMeta: {
          slugProjectName,
          desired_filename: metaFileName,
          slugMediaName: metaFileName,
          layer_id,
          x,
          y,
          z_index
        }
      });
    },
    removePubliMedia({ slugMediaName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • DrawingPad: removeMedia / slugMediaName = ${slugMediaName}`
        );
      }

      this.$root.removeMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName
      });
    },
    getHighestZNumberAmongstMedias(page_medias) {
      if (!page_medias) return 0;

      const medias_with_z = page_medias
        .filter(m => m.publi_meta.hasOwnProperty("z_index"))
        .map(m => {
          return m.publi_meta.z_index;
        });

      if (medias_with_z.length === 0) return 0;

      return Math.max(...medias_with_z);
    },
    updateMediasPubli() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: updateMediasPubli`);
      }

      if (
        !this.publication.hasOwnProperty("medias") ||
        Object.keys(this.publication.medias).length === 0
      ) {
        this.publication_medias = {};
        return;
      }

      // get list of publications items
      let medias_paginated = {};
      let missingMedias = [];

      Object.keys(this.publication.medias).map(metaFileName => {
        const _media = this.publication.medias[metaFileName];

        // for each, get slugFolderName and metaFileName
        if (
          !_media.hasOwnProperty("slugProjectName") ||
          !_media.hasOwnProperty("metaFileName")
        ) {
          return;
        }

        const slugProjectName = _media.slugProjectName;
        const slugMediaName = _media.slugMediaName;

        // find in store if slugFolderName exists
        if (!this.$root.store.projects.hasOwnProperty(slugProjectName)) {
          console.error(
            `Missing project in store — not expected : ${slugProjectName}`
          );
          console.error(
            `Medias from project was probably added to the publication before it was removed altogether.`
          );
          return;
        }

        // find in store if metaFileName exists
        const project_medias = this.$root.store.projects[slugProjectName]
          .medias;
        if (!project_medias.hasOwnProperty(slugMediaName)) {
          console.log(`Some medias missing from client`);
          missingMedias.push({
            slugFolderName: slugProjectName,
            metaFileName: slugMediaName
          });
        } else {
          let meta = JSON.parse(JSON.stringify(project_medias[slugMediaName]));

          if (meta.hasOwnProperty("_isAbsent") && meta._isAbsent) {
            console.error(
              `Missing media in store — not expected : ${slugProjectName} / ${slugMediaName}`
            );
            console.error(
              `Media was probably added to the publication before it was removed.`
            );
            return;
          }

          meta.slugProjectName = slugProjectName;
          meta.publi_meta = JSON.parse(JSON.stringify(_media));

          if (_media.hasOwnProperty("layer_id")) {
            if (!medias_paginated.hasOwnProperty(_media.layer_id)) {
              medias_paginated[_media.layer_id] = [];
            }

            medias_paginated[_media.layer_id].push(meta);
          }
          return;
        }
      });

      console.log(
        `Finished building media list. Missing medias: ${missingMedias.length}`
      );

      // send list of medias to get
      if (missingMedias.length > 0) {
        this.$root.listSpecificMedias({
          type: "projects",
          medias_list: missingMedias
        });
      }

      this.publication_medias = medias_paginated;
    },
    toggleFullscreen() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • DrawingPad: toggleFullscreen`);
      }
      const docElem = this.$refs.panel;
      if (this.fullscreen_mode === false) {
        if (!!docElem.requestFullscreen) {
          // W3C API
          docElem.requestFullscreen();
        } else if (!!docElem.mozRequestFullScreen) {
          // Mozilla current API
          docElem.mozRequestFullScreen();
        } else if (!!docElem.webkitRequestFullScreen) {
          // Webkit current API
          docElem.webkitRequestFullScreen();
        } // Maybe other prefixed APIs?
        this.fullscreen_mode = true;
      } else {
        if (!!document.exitFullscreen) {
          // W3C API
          document.exitFullscreen();
        } else if (!!document.mozExitFullscreen) {
          // Mozilla current API
          document.mozExitFullscreen();
        } else if (!!document.webkitExitFullscreen) {
          // Webkit current API
          document.webkitExitFullscreen();
        } // Maybe other prefixed APIs?
        this.fullscreen_mode = false;
      }

      setTimeout(() => {
        this.updatePageSizeAccordingToPanel();
      }, 500);
    },

    updatePageSizeAccordingToPanel() {
      if (!this.$refs.panel) return;
      const panel_width = this.$refs.panel.offsetWidth;
      const current_page_el = this.$refs.current_page;

      if (current_page_el && panel_width > 0) {
        const page = current_page_el.querySelector(
          ".m_drawingPad--backgroundContainer--background"
          // ".m_page"
        );
        const margins = 150;
        if (page && panel_width < page.offsetWidth + margins) {
          this.zoom = panel_width / (page.offsetWidth + margins);
        }
      }
    },

    getDrawingLayerReferenceMedia(id) {
      const reference_media = Object.values(this.publication.medias).find(
        m => m.layer_id === id
      );
      if (reference_media) return reference_media;
      return false;
    }
  }
};
</script>
<style></style>
