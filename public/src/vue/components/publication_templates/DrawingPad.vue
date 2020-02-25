<template>
  <div
    class="m_publicationview"
    :class="{ 'is--preview': preview_mode }"
    ref="panel"
  >
    <PublicationHeader
      :slugPubliName="slugPubliName"
      :publication="publication"
      :publication_medias="publication_medias"
      @export="show_export_modal = true"
    />

    <!-- <pre>{{ publication_medias }}</pre> -->
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
          <polygon
            class="st0"
            points="58.7,112.2 58.7,133.2 0,133.2 0,74.5 21,74.5 21,112.2 	"
          />
          <polygon
            class="st0"
            points="112.3,74.5 133.3,74.5 133.3,133.2 74.6,133.2 74.6,112.2 112.3,112.2 	"
          />
          <polygon
            class="st0"
            points="21,58.7 0,58.7 0,0 58.7,0 58.7,21 21,21 	"
          />
          <polygon
            class="st0"
            points="133.3,58.7 112.3,58.7 112.3,21 74.6,21 74.6,0 133.3,0 	"
          />
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
          <polygon
            class="st0"
            points="0,95.5 0,74.5 58.7,74.5 58.7,133.2 37.7,133.2 37.7,95.5 	"
          />
          <polygon
            class="st0"
            points="95.6,133.2 74.6,133.2 74.6,74.5 133.3,74.5 133.3,95.5 95.6,95.5 	"
          />
          <polygon
            class="st0"
            points="37.7,0 58.7,0 58.7,58.7 0,58.7 0,37.7 37.7,37.7 	"
          />
          <polygon
            class="st0"
            points="74.6,0 95.6,0 95.6,37.7 133.3,37.7 133.3,58.7 74.6,58.7 	"
          />
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
          <path
            d="M102.6,0v83.1h79.9v21.2h-79.9v83.8H79.9v-83.8H0V83.1h79.9V0H102.6z"
          />
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

    <div class="m_layerPanel">
      <label>{{ $t("layers") }}</label>
      <div
        v-for="layer in layers.slice().reverse()"
        :key="layer.id"
        class="m_layerPanel--layer"
        @click="toggleActiveLayer(layer.id)"
        :class="{ 'is--active': layer.id === id_of_layer_opened }"
      >
        <button
          type="button"
          class="buttonLink _no_underline"
          @click.stop="toggleActiveLayer(layer.id)"
          :class="{ 'is--active': layer.id === id_of_layer_opened }"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="100.7px"
            height="101px"
            viewBox="0 0 100.7 101"
            style="enable-background:new 0 0 100.7 101;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
              L19.1,91.5z"
            />
          </svg>
        </button>
        <div class="">
          <span class="text-ellipsis">{{ layer.id }}</span
          ><br />
          <span v-if="publication_medias.hasOwnProperty(layer.id)">
            <template v-if="publication_medias[layer.id].length === 1">
              ({{
                publication_medias[layer.id].length +
                  " " +
                  $t("media").toLowerCase()
              }})
            </template>
            <template v-else>
              ({{
                publication_medias[layer.id].length +
                  " " +
                  $t("medias").toLowerCase()
              }})
            </template>
          </span>
        </div>
        <button
          v-if="layer.id === id_of_layer_opened"
          type="button"
          class="buttonLink _no_underline"
          @click="removeLayer(layer.id)"
          :disabled="read_only"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="91.6px"
            height="95px"
            viewBox="0 0 91.6 95"
            style="enable-background:new 0 0 91.6 95;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
            />
          </svg>
        </button>
      </div>
      <button type="button" @click="createLayer">
        {{ $t("create") }}
      </button>
    </div>

    <div class="m_drawingPad" ref="current_page">
      <!-- <small><pre>{{ publication_medias }}</pre>
      </small> -->
      <div
        class="m_drawingPad--backgroundContainer"
        :style="
          `
          width: ${layer_options.width * this.zoom}mm;
          height: ${layer_options.height * this.zoom}mm;
        `
        "
      >
        <div
          class="m_drawingPad--backgroundContainer--background"
          :style="
            `
          width: ${layer_options.width}mm;
          height: ${layer_options.height}mm;
          transform: scale(${this.zoom});
        `
          "
        ></div>
      </div>
      <PagePublicationSinglePage
        v-for="layer in layers"
        :class="{
          'is--inactive': id_of_layer_opened && layer.id !== id_of_layer_opened
        }"
        :key="layer.id"
        :mode="'export'"
        :preview_mode="false"
        :slugPubliName="slugPubliName"
        :page="layer_options"
        :publication_medias="publication_medias[layer.id]"
        :read_only="read_only"
        :pixelsPerMillimeters="pixelsPerMillimeters"
        :zoom="zoom"
      />
      <!-- <PadSurface /> -->
    </div>
    <div
      ref="mmMeasurer"
      style="height: 10mm; width: 10mm; left: 100%; position: fixed; top: 100%;"
    />
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import PadSurface from "../subcomponents/PadSurface.vue";
import PagePublicationSinglePage from "./PagePublicationSinglePage.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    read_only: Boolean
  },
  components: {
    PublicationHeader,
    PadSurface,
    PagePublicationSinglePage
  },
  data() {
    return {
      show_export_modal: false,
      publication_medias: [],
      accepted_media_type: ["audio", "video"],

      id_of_layer_opened: false,

      preview_mode: this.$root.state.mode !== "live",
      fullscreen_mode: false,
      zoom: 1,
      zoom_min: 0.2,
      zoom_max: 2,

      pixelsPerMillimeters: 0
    };
  },
  created() {
    this.$root.setPublicationZoom(this.zoom);
  },
  mounted() {
    this.$root.settings.current_publication.accepted_media_type = [
      "image",
      "video",
      "audio",
      "text",
      "document",
      "other"
    ];

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

    this.$root.settings.current_publication.accepted_media_type = [];
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

      if (!this.id_of_layer_opened) {
        console.log(`METHODS • Publication: addMedia missing layer id`);
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("select_layer_to_add_media_to"));
      }

      const layer_id = this.id_of_layer_opened;

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
    toggleActiveLayer(id) {
      if (id === this.id_of_layer_opened) this.id_of_layer_opened = false;
      else this.id_of_layer_opened = id;
    },
    removeLayer(id) {
      if (
        !this.publication.hasOwnProperty("layers") ||
        this.publication.layers.length === 0
      ) {
        return;
      }

      let layers = this.publication.layers.filter(l => l.id !== id);

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          layers
        }
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
    generateID() {
      return (
        +new Date() +
        "_" +
        (Math.random().toString(36) + "00000000000000000").slice(2, 3)
      );
    },
    createLayer() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • DrawingPad: createLayer`);

      let layers = [];
      if (
        this.publication.hasOwnProperty("layers") &&
        this.publication.layers.length > 0
      ) {
        layers = this.publication.layers.slice();
      }

      const index = this.publication.layers.length + 1;

      layers.splice(index, 0, {
        id: this.generateID()
      });

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          layers
        }
      });
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
      const panel_width = this.$refs.panel.offsetWidth;
      const current_page_el = this.$refs.current_page;

      debugger;
      if (current_page_el && panel_width > 0) {
        const page = current_page_el.getElementsByClassName("m_page")[0];

        const margins = 100;
        if (!!page && panel_width < page.offsetWidth + margins) {
          this.zoom = panel_width / (page.offsetWidth + margins);
        }
      }
    }
  }
};
</script>
<style></style>
