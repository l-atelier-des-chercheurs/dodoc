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
      :show_export_button="false"
    />

    <!-- <ExportVideoPubliModal
      v-if="show_export_modal"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :instructions="$t('export_video_instructions')"
    />-->

    <div class="m_carreauPublication">
      <!-- <div class="margin-medium" v-if="publication_medias.length === 0">
        <p>
          <small v-html="$t('add_multiple_videos_files')" />
        </p>
      </div>-->

      <div
        class="m_carreauPublication--container"
        :class="{ 'is--fullscreen': fullscreen_mode }"
        ref="carreau_container"
        :style="carreauContainerProperties"
      >
        <div
          class="m_publicationSettings"
          v-if="
            ![
              'export_publication',
              'print_publication',
              'link_publication',
            ].includes($root.state.mode)
          "
        >
          <button
            class="margin-vert-verysmall font-verysmall _preview_button"
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
              style="enable-background: new 0 0 144 84;"
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
              style="enable-background: new 0 0 133.3 133.2;"
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
              style="enable-background: new 0 0 133.3 133.2;"
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
              style="enable-background: new 0 0 182.5 188.1;"
              xml:space="preserve"
            >
              <defs />
              <path
                d="M102.6,0v83.1h79.9v21.2h-79.9v83.8H79.9v-83.8H0V83.1h79.9V0H102.6z"
              />
            </svg>
          </button>
          <button
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
              style="enable-background: new 0 0 155.6 21.2;"
              xml:space="preserve"
            >
              <defs />
              <path d="M155.6,0v21.2H0V0H155.6z" />
            </svg>
          </button>
        </div>

        <div
          class="m_carreauPublication--container--content"
          :style="carreauContentProperties"
        >
          <h2 class="m_carreauPublication--container--content--title">
            {{ publication.name }}
          </h2>
          <transition-group name="fade_fast" :duration="300" tag="div">
            <div
              v-for="(media, index) in last_nth_of_publication_medias"
              :key="media.publi_meta.metaFileName"
            >
              <!-- style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;" -->
              <MediaCarreau
                :media="media"
                :page="page"
                :preview_mode="preview_mode"
                :read_only="read_only"
                @removePubliMedia="
                  (values) => {
                    removePubliMedia(values);
                  }
                "
                @editPubliMedia="
                  (values) => {
                    editPubliMedia(values);
                  }
                "
              />
              <!-- :opacity="1.5 - (last_nth_of_publication_medias.length - index) / 8" -->
              <!-- <div class="m_videoPublication--media--moveItemButtons">
            <button
              type="button"
              class="m_videoPublication--media--moveItemButton--before"
              v-show="index > 0"
              @click="move(media.publi_meta.metaFileName, -1)"
            >
              <img src="/images/i_arrow_left.svg" draggable="false" />
            </button>
            <button
              type="button"
              class="m_videoPublication--media--moveItemButton--after"
              v-show="index < publication_medias.length - 1"
              @click="move(media.publi_meta.metaFileName, +1)"
            >
              <img src="/images/i_arrow_right.svg" draggable="false" />
            </button>
              </div>-->
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import MediaCarreau from "../subcomponents/MediaCarreau.vue";
import { setTimeout } from "timers";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    read_only: Boolean,
  },
  components: {
    PublicationHeader,
    MediaCarreau,
  },
  data() {
    return {
      show_export_modal: false,
      publication_medias: [],
      medias_slugs_in_order: [],

      page: {
        ratio: 0.5625,
        width: 0,
        height: 0,
        // in %
        margin_left: 0,
        margin_right: 0,
        margin_top: 0,
        margin_bottom: 0,
        gridstep: false,
      },

      preview_mode: this.$root.state.mode !== "live",
      fullscreen_mode: false,
      zoom: 1,
      zoom_min: 0.4,
      zoom_max: 1.4,

      has_media_selected: false,
    };
  },
  created() {
    this.$root.setPublicationZoom(this.zoom);
  },
  mounted() {
    this.$root.settings.current_publication.accepted_media_type = [
      "video",
      "image",
      "audio",
    ];

    this.$eventHub.$on("publication.addMedia", this.addMedia);
    this.$eventHub.$on(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );

    if (
      this.publication.hasOwnProperty("medias_slugs") &&
      this.publication.medias_slugs.length > 0
    ) {
      this.medias_slugs_in_order = this.publication.medias_slugs;
    }

    this.updatePageSizeAccordingToPanel();
    this.$eventHub.$on(
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
    this.$eventHub.$off(
      "activity_panels_resized",
      this.updatePageSizeAccordingToPanel
    );

    this.$root.settings.current_publication.accepted_media_type = [];
  },
  watch: {
    "publication.medias": function () {
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
      deep: true,
    },
    "publication.medias_slugs": function () {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`WATCH • Publication: publication.medias_slugs`);
      }

      this.medias_slugs_in_order =
        typeof this.publication.medias_slugs === "object"
          ? this.publication.medias_slugs
          : [];
      this.updateMediasPubli();
    },
    zoom: function () {
      this.zoom = Math.min(this.zoom_max, Math.max(this.zoom_min, this.zoom));
      this.$root.setPublicationZoom(this.zoom);
    },
    "$root.settings.publi_zoom": function () {
      this.zoom = this.$root.settings.publi_zoom;
    },
  },
  computed: {
    carreauContainerProperties() {
      return `
        width: ${100 * this.$root.settings.publi_zoom}%; 
        height: ${this.page.height * this.$root.settings.publi_zoom}px;      
      `;
    },
    carreauContentProperties() {
      return `
        width: ${this.page.width}px; 
        height: ${this.page.height}px;      
          transform: scale(${this.$root.settings.publi_zoom});
        `;
    },
    last_nth_of_publication_medias() {
      return this.publication_medias.slice(-10);
    },
  },
  methods: {
    addMedia({ slugProjectName, metaFileName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: addMedia with 
        slugProjectName = ${slugProjectName} and metaFileName = ${metaFileName}`);
      }

      const desired_filename = metaFileName;

      this.$eventHub.$on("socketio.media_created_or_updated", (d) => {
        this.$eventHub.$off("socketio.media_created_or_updated");

        this.medias_slugs_in_order.push({
          slugMediaName: d.metaFileName,
        });

        this.$root.editFolder({
          type: "publications",
          slugFolderName: this.slugPubliName,
          data: {
            medias_slugs: this.medias_slugs_in_order,
          },
        });
      });

      this.$root.createMedia({
        slugFolderName: this.slugPubliName,
        type: "publications",
        additionalMeta: {
          slugProjectName,
          desired_filename,
          slugMediaName: metaFileName,
          x: Math.random().toFixed(2) / 3,
          y: Math.random().toFixed(2) / 3,
          width: 0.3 + Math.random().toFixed(2) / 3,
          rotate: (Math.random().toFixed(2) - 0.5) * 5,
        },
      });
    },
    removePubliMedia({ slugMediaName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • Publication: removeMedia / slugMediaName = ${slugMediaName}`
        );
      }

      this.$root.removeMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName,
      });

      if (this.medias_slugs_in_order.length > 0) {
        this.medias_slugs_in_order = this.medias_slugs_in_order.filter(
          (m) => m.slugMediaName !== slugMediaName
        );
      }

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          medias_slugs: this.medias_slugs_in_order,
        },
      });
    },
    editPubliMedia({ slugMediaName, val }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • Publication: editPubliMedia / args = ${JSON.stringify(
            arguments[0],
            null,
            4
          )}`
        );
      }

      this.$root.editMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName,
        data: val,
      });
    },
    updateMediasPubli() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: updateMediasPubli`);
      }

      if (
        !this.publication.hasOwnProperty("medias") ||
        Object.keys(this.publication.medias).length === 0
      ) {
        this.publication_medias = [];
        return;
      }

      // get list of publications items
      let publi_medias = [];
      let missingMedias = [];

      if (this.medias_slugs_in_order.length === 0) {
        this.publication_medias = [];
        return;
      }

      this.medias_slugs_in_order.map((item) => {
        const metaFileName = item.slugMediaName;

        if (!this.publication.medias.hasOwnProperty(metaFileName)) {
          // error : a media referenced in medias_slugs is not in this.publication.medias
          return;
        }

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
            metaFileName: slugMediaName,
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

          publi_medias.push(meta);
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
          medias_list: missingMedias,
        });
      }

      this.publication_medias = publi_medias;
    },
    move(metaFileName, dir) {
      const idx = this.medias_slugs_in_order.findIndex(
        (m) => m.slugMediaName === metaFileName
      );
      console.log(
        `METHODS • VideoPublication: move idx = ${idx} and dir = ${dir}`
      );

      if (dir < 0) {
        this.medias_slugs_in_order.move(idx, idx + dir);
      } else if (dir > 0) {
        this.medias_slugs_in_order.move(idx + dir, idx);
      }

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          medias_slugs: this.medias_slugs_in_order,
        },
      });
    },
    toggleFullscreen() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • PagePublication: toggleFullscreen`);
      }
      const docElem = this.$refs.carreau_container;
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
      this.page.width = this.$refs.carreau_container.offsetWidth;
      this.page.height = this.page.width * this.page.ratio;
    },
  },
};
</script>
<style></style>
