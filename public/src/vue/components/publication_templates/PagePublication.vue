<template>
  <div
    class="m_publicationview"
    :class="{ 'is--preview': preview_mode, 'is--fullscreen': fullscreen_mode }"
    ref="panel"
  >
    <PublicationHeader
      :slugPubliName="slugPubliName"
      :publication="publication"
      :publication_medias="publication_medias"
      @export="show_export_modal = true"
    />

    <ExportPagePubli
      v-if="show_export_modal"
      :publication="publication"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
    />

    <div class="m_publicationview--settings">
      <div
        class
        v-if="
          ![
            'export_publication',
            'print_publication',
            'link_publication'
          ].includes($root.state.mode)
        "
      >
        <input id="settings" type="checkbox" v-model="advanced_options" />
        <label for="settings">{{ $t("settings") }}</label>
      </div>

      <template v-if="advanced_options">
        <hr />
        <!-- <div class="margin-bottom-small">
          <label>{{ $t('template') }}</label>
          <select v-model="new_style" @change="updatePublicationOption($event, 'style')">
        <option value="standard">standard</option>-->
        <!-- <option value="feuille de choux">feuille de choux</option>
        <option value="human tech days">human tech days</option>-->
        <!-- </select>
        </div>-->

        <hr />

        <div class="margin-bottom-small">
          <label>{{ $t("header_left") }}</label>
          <input
            class="input-large"
            type="text"
            v-model="new_header_left"
            @change="updatePublicationOption($event, 'header_left')"
            :readonly="read_only"
          />
        </div>

        <div class="margin-bottom-small">
          <label>{{ $t("header_right") }}</label>
          <input
            class="input-large"
            type="text"
            v-model="new_header_right"
            @change="updatePublicationOption($event, 'header_right')"
            :readonly="read_only"
          />
        </div>

        <hr />

        <div class="margin-bottom-small">
          <label>{{ $t("width") }}(mm)</label>
          <input
            type="number"
            min="1"
            max="1000"
            step="1"
            v-model="new_width"
            @input="updatePublicationOption($event, 'width')"
          />
        </div>

        <div class="margin-bottom-small">
          <label>{{ $t("height") }}(mm)</label>
          <input
            type="number"
            min="1"
            max="1000"
            step="1"
            v-model="new_height"
            @input="updatePublicationOption($event, 'height')"
          />
        </div>

        <div class="margin-bottom-small">
          <label>{{ $t("gridstep") }}(mm)</label>
          <input
            type="number"
            min="1"
            max="100"
            step="1"
            v-model="new_gridstep"
            @input="updatePublicationOption($event, 'gridstep')"
          />
          <span class="switch switch-xs">
            <input
              type="checkbox"
              class="switch"
              id="favFilter"
              v-model="new_snap_to_grid"
              @change="
                updatePublicationOption(new_snap_to_grid, 'snap_to_grid')
              "
              :readonly="read_only"
            />
            <label for="favFilter">{{ $t("snap_to_grid") }}</label>
          </span>
        </div>

        <hr />

        <div class="margin-bottom-small">
          <label>{{ $t("margin_top") }}(mm)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            v-model="new_margin_top"
            @input="updatePublicationOption($event, 'margin_top')"
          />
        </div>
        <div class="margin-bottom-small">
          <label>{{ $t("margin_bottom") }}(mm)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            v-model="new_margin_bottom"
            @input="updatePublicationOption($event, 'margin_bottom')"
          />
        </div>
        <div class="margin-bottom-small">
          <label>{{ $t("margin_left") }}(mm)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            v-model="new_margin_left"
            @input="updatePublicationOption($event, 'margin_left')"
          />
        </div>
        <div class="margin-bottom-small">
          <label>{{ $t("margin_right") }}(mm)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            v-model="new_margin_right"
            @input="updatePublicationOption($event, 'margin_right')"
          />
        </div>

        <hr />

        <div class="margin-bottom-small">
          <label for="show_page_number">{{ $t("show_page_numbers") }}</label>
          <input
            id="show_page_number"
            type="checkbox"
            v-model="new_show_page_number"
            @change="
              updatePublicationOption(new_show_page_number, 'show_page_number')
            "
          />
        </div>
      </template>
    </div>

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

      <!-- <button 
        class="margin-vert-verysmall font-verysmall" 
        :class="{ 'is--active' : !preview_mode }"
        @click="preview_mode = !preview_mode"
      >
        CSS
      </button>-->

      <!-- <button 
        class="margin-vert-verysmall font-verysmall" 
        style="padding: 9px"
        @click="printThisPublication()"
      >
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="160.3px"
	 height="140.9px" viewBox="0 0 147.3 128.9" style="enable-background:new 0 0 147.3 128.9;" xml:space="preserve">
<defs>
</defs>
<path d="M139.9,88.4V44.2 M139.9,88.4V44.2 M0,88.4V44.2 M147.3,88.4V44.2 M97.6,86.5H49.7c-2,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7
	h47.9c2,0,3.7-1.7,3.7-3.7S99.6,86.5,97.6,86.5 M97.6,105H49.7c-2,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h47.9c2,0,3.7-1.7,3.7-3.7
	S99.6,105,97.6,105 M97.6,86.5H49.7c-2,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h47.9c2,0,3.7-1.7,3.7-3.7S99.6,86.5,97.6,86.5 M97.6,105
	H49.7c-2,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h47.9c2,0,3.7-1.7,3.7-3.7S99.6,105,97.6,105 M97.6,105H49.7c-2,0-3.7,1.7-3.7,3.7
	s1.7,3.7,3.7,3.7h47.9c2,0,3.7-1.7,3.7-3.7S99.6,105,97.6,105 M97.6,86.5H49.7c-2,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h47.9
	c2,0,3.7-1.7,3.7-3.7S99.6,86.5,97.6,86.5 M49.7,93.9h47.9c2,0,3.7-1.7,3.7-3.7s-1.7-3.7-3.7-3.7H49.7c-2,0-3.7,1.7-3.7,3.7
	S47.7,93.9,49.7,93.9 M97.6,105H49.7c-2,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h47.9c2,0,3.7-1.7,3.7-3.7S99.6,105,97.6,105 M132.6,29.5
	h-12.9V3.7c0-2-1.7-3.7-3.7-3.7H31.3c-2,0-3.7,1.7-3.7,3.7v25.8H14.7C6.6,29.5,0,36.1,0,44.2v44.2c0,8.1,6.6,14.7,14.7,14.7h12.9
	v22.1c0,2,1.7,3.7,3.7,3.7H116c2,0,3.7-1.7,3.7-3.7v-22.1h12.9c8.1,0,14.7-6.6,14.7-14.7V44.2C147.3,36.1,140.7,29.5,132.6,29.5
	 M35,7.4h77.3v22.1H35V7.4z M112.3,121.5H35V77.3h77.3L112.3,121.5L112.3,121.5z M139.9,88.4c0,4.1-3.3,7.4-7.4,7.4h-12.9V73.7
	c0-2-1.7-3.7-3.7-3.7H31.3c-2,0-3.7,1.7-3.7,3.7v22.1H14.7c-4.1,0-7.4-3.3-7.4-7.4V44.2c0-4.1,3.3-7.4,7.4-7.4h117.9
	c4.1,0,7.4,3.3,7.4,7.4V88.4z M49.7,93.9h47.9c2,0,3.7-1.7,3.7-3.7s-1.7-3.7-3.7-3.7H49.7c-2,0-3.7,1.7-3.7,3.7S47.7,93.9,49.7,93.9
	 M49.7,112.3h47.9c2,0,3.7-1.7,3.7-3.7s-1.7-3.7-3.7-3.7H49.7c-2,0-3.7,1.7-3.7,3.7S47.7,112.3,49.7,112.3 M97.6,105H49.7
	c-2,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h47.9c2,0,3.7-1.7,3.7-3.7S99.6,105,97.6,105 M97.6,86.5H49.7c-2,0-3.7,1.7-3.7,3.7
	s1.7,3.7,3.7,3.7h47.9c2,0,3.7-1.7,3.7-3.7S99.6,86.5,97.6,86.5 M97.6,86.5H49.7c-2,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h47.9
	c2,0,3.7-1.7,3.7-3.7S99.6,86.5,97.6,86.5 M97.6,105H49.7c-2,0-3.7,1.7-3.7,3.7s1.7,3.7,3.7,3.7h47.9c2,0,3.7-1.7,3.7-3.7
	S99.6,105,97.6,105"/>
</svg>
      </button>-->

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

    <div class="m_publicationview--pages" ref="pages">
      <!-- si transition, attention à ref -->
      <!-- <transition-group
        name="list-complete"
      >-->
      <div
        v-for="(page, pageNumber) in pagesWithDefault"
        :key="page.id"
        :ref="
          pageNumber === number_of_page_currently_active ? 'current_page' : ''
        "
      >
        <div
          class="m_publicationFooter"
          v-if="
            ![
              'export_publication',
              'print_publication',
              'link_publication'
            ].includes($root.state.mode) && pageNumber === 0
          "
        >
          <button
            type="button"
            class="buttonLink"
            @click="insertPageAtIndex(pageNumber)"
          >
            {{ $t("add_a_page_before") }}
          </button>
        </div>

        <PagePublicationSinglePage
          :preview_mode="preview_mode"
          :slugPubliName="slugPubliName"
          :pageNumber="pageNumber"
          :page="page"
          :publication_medias="publication_medias[pageNumber + '']"
          :read_only="read_only"
          :pixelsPerMillimeters="pixelsPerMillimeters"
        />

        <div
          class="m_publicationFooter"
          v-if="
            ![
              'export_publication',
              'print_publication',
              'link_publication'
            ].includes($root.state.mode)
          "
        >
          <button
            type="button"
            class="buttonLink"
            @click="insertPageAtIndex(pageNumber + 1)"
          >
            {{ $t("add_a_page_here") }}
          </button>
          <button
            type="button"
            class="buttonLink"
            @click="removePageAtIndex(pageNumber)"
          >
            {{ $t("remove_this_page") }}
          </button>
        </div>
      </div>
      <!-- </transition-group> -->

      <div
        class="m_publicationFooter"
        v-if="
          ![
            'export_publication',
            'print_publication',
            'link_publication'
          ].includes($root.state.mode) && pagesWithDefault.length === 0
        "
      >
        <button
          type="button"
          class="buttonLink"
          @click="insertPageAtIndex(pageNumber + 1)"
        >
          {{ $t("add_a_page") }}
        </button>
      </div>
    </div>

    <div
      class="m_publicationFooter margin-vert-small"
      v-if="
        ['export_publication', 'link_publication'].includes($root.state.mode)
      "
    >
      <a
        class="js--openInBrowser c-noir"
        target="_blank"
        href="https://latelier-des-chercheurs.fr/outils/dodoc"
      >
        {{ $t("made_with_dodoc") }}
        <img
          :src="
            this.$root.state.mode === 'export_publication'
              ? './_images/i_logo.svg'
              : '/images/i_logo.svg'
          "
          @click="goHome()"
          draggable="false"
        />
      </a>
    </div>
    <div
      ref="mmMeasurer"
      style="height: 10mm; width: 10mm; left: 100%; position: fixed; top: 100%;"
    />
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import ExportPagePubli from "../modals/ExportPagePubli.vue";
import PagePublicationSinglePage from "./PagePublicationSinglePage.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    read_only: Boolean
  },
  components: {
    PublicationHeader,
    ExportPagePubli,
    PagePublicationSinglePage
  },
  data() {
    return {
      publication_medias: [],
      publication_defaults: {
        page_by_page: {
          width: 210,
          height: 297,
          style: "standard",
          margin_left: 10,
          margin_right: 10,
          margin_top: 20,
          margin_bottom: 20,
          gridstep: 10,
          snap_to_grid: true,
          header_left: "",
          header_right: "",
          show_page_number: true
        }
      },

      show_edit_css_window: false,

      advanced_options: false,

      new_width: 0,
      new_height: 0,
      new_template: "",
      new_style: "",
      new_gridstep: 0,
      new_snap_to_grid: false,
      new_margin_left: 0,
      new_margin_top: 0,
      new_margin_right: 0,
      new_margin_bottom: 0,
      new_header_left: "",
      new_header_right: "",
      new_show_page_number: false,

      number_of_page_currently_active: 0,
      preview_mode: this.$root.state.mode !== "live",
      // preview_mode: false,
      fullscreen_mode: false,
      zoom: 1,
      zoom_min: 0.4,
      zoom_max: 1.4,

      pixelsPerMillimeters: 0,
      has_media_selected: false,
      show_export_modal: false
    };
  },
  created() {
    // when opening a publi, we’ll need to use the medias field to request some actual content
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

    this.$eventHub.$on("publication.addMedia", this.addMedia);
    this.$eventHub.$on(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );
    document.addEventListener("keyup", this.publicationKeyListener);
    this.updateMediasPubli();
    this.pixelsPerMillimeters = this.$refs.hasOwnProperty("mmMeasurer")
      ? this.$refs.mmMeasurer.offsetWidth / 10
      : 38;
    this.updatePubliOptionsInFields();

    this.$nextTick(() => {
      this.updatePageSizeAccordingToPanel();
      this.$eventHub.$on(
        "activity_panels_resized",
        this.updatePageSizeAccordingToPanel
      );
    });

    document.getElementsByTagName("body")[0].style = `
      --page-width: ${this.publications_options.width}mm; 
      --page-height: ${this.publications_options.height}mm
    `;
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.addMedia", this.addMedia);
    this.$eventHub.$off(
      "socketio.projects.listSpecificMedias",
      this.updateMediasPubli
    );
    document.removeEventListener("keyup", this.publicationKeyListener);

    this.$eventHub.$off(
      "activity_panels_resized",
      this.updatePageSizeAccordingToPanel
    );
  },

  watch: {
    "publication.medias": function() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`WATCH • Publication: publication.medias`);
      }
      this.updateMediasPubli();
    },
    publications_options: {
      handler() {
        if (this.$root.state.dev_mode === "debug") {
          console.log(`WATCH • Publication: publications_options`);
        }
        this.updatePubliOptionsInFields();
        document.getElementsByTagName("body")[0].style = `
          --page-width: ${this.publications_options.width}mm; 
          --page-height: ${this.publications_options.height}mm
        `;
      },
      deep: true
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
      this.zoom = Math.min(this.zoom_max, Math.max(this.zoom_min, this.zoom));
      this.$root.setPublicationZoom(this.zoom);
    },
    "$root.settings.publi_zoom": function() {
      this.zoom = this.$root.settings.publi_zoom;
    }
  },
  computed: {
    publications_options() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`COMPUTED • publications_options`);
      }
      // set default values to options
      if (!this.publication.hasOwnProperty("template")) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error("Missing template in publication");
      }
      if (
        !this.publication_defaults.hasOwnProperty(this.publication.template)
      ) {
        console.log(
          "No defaults for this template. Returning original publication object."
        );
        return this.publication;
      }

      let publication_options = this.publication_defaults[
        this.publication.template
      ];
      for (let k of Object.keys(publication_options)) {
        if (this.publication.hasOwnProperty(k)) {
          publication_options[k] = this.publication[k];
        }
      }

      return publication_options;
    },
    pagesWithDefault() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`COMPUTED • pagesWithDefault`);
      }

      if (
        !this.publication.hasOwnProperty("pages") ||
        this.publication.pages.length === 0
      ) {
        return [];
      }

      let defaultPages = [];
      // we need to clone this object to prevent it from being changed
      let pagesClone = JSON.parse(JSON.stringify(this.publication.pages));

      for (let page of pagesClone) {
        for (let k of Object.keys(this.publications_options)) {
          const option = this.publications_options[k];
          if (typeof option === "number") {
            if (page.hasOwnProperty(k) && !Number.isNaN(page[k])) {
              page[k] = Number.parseInt(page[k]);
            } else {
              page[k] = option;
            }
          } else if (typeof option === "string") {
            if (page.hasOwnProperty(k) && typeof page[k] === "string") {
              // page[k] = page[k];
            } else {
              page[k] = option;
            }
          } else if (typeof option === "boolean") {
            page[k] = option;
          }
        }
        defaultPages.push(page);
      }
      return defaultPages;
    }
  },
  methods: {
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
    addMedia({ slugProjectName, metaFileName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: addMedia with 
        slugProjectName = ${slugProjectName} and metaFileName = ${metaFileName}`);
      }

      const lastPageNumber = this.publication.pages.length - 1;
      let page = lastPageNumber;
      if (this.number_of_page_currently_active !== false) {
        page = this.number_of_page_currently_active;
      }

      const page_id = this.publication.pages[page].id;
      const x = this.publications_options.margin_left;
      const y = this.publications_options.margin_top;

      const z_index =
        this.getHighestZNumberAmongstMedias(this.publication_medias[page]) + 1;

      const newMediaMeta = {
        slugProjectName,
        desired_filename: metaFileName,
        slugMediaName: metaFileName,
        page_id,
        x,
        y,
        z_index
      };

      this.$root.createMedia({
        slugFolderName: this.slugPubliName,
        type: "publications",
        additionalMeta: newMediaMeta
      });
    },
    printThisPublication() {
      this.preview_mode = true;
      this.$root.setPublicationZoom(1);

      setTimeout(() => {
        window.print();
      }, 500);
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

          let expected_page = _media.hasOwnProperty("page_id")
            ? this.publication.pages.findIndex(p => p.id === _media.page_id)
            : 0;

          // let expected_page = _media.hasOwnProperty('page_id') ? _media.page) : this.publication.pages.length - 1;

          if (!medias_paginated.hasOwnProperty(expected_page)) {
            medias_paginated[expected_page] = [];
          }
          medias_paginated[expected_page].push(meta);
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
    insertPageAtIndex(index) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: insertPageAtIndex ${index}`);
      }

      // insert page in page array
      let pages = [];
      if (
        this.publication.hasOwnProperty("pages") &&
        this.publication.pages.length > 0
      ) {
        pages = this.publication.pages.slice();
      }
      pages.splice(index, 0, {
        id:
          +new Date() +
          "_" +
          (Math.random().toString(36) + "00000000000000000").slice(2, 3)
      });

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          pages
        }
      });

      $(this.$refs.panel).animate(
        {
          scrollTop: "+=400"
        },
        600,
        $.easing.easeInOutQuint
      );
    },
    removePageAtIndex(index) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: removePageAtIndex`);
      }
      let pages = [];
      if (this.publication.hasOwnProperty("pages")) {
        pages = this.publication.pages.slice();
      }
      pages.splice(index, 1);

      // do not remove medias, in case of mistake when deleting

      // let medias_list = [];
      // if(this.publication.hasOwnProperty('medias_list')) {
      //   medias_list = this.publication.medias_list.slice();
      // }

      // medias_list = medias_list.filter((m) => {
      //   if(m.hasOwnProperty('page') && Number.parseInt(m.page) - 1 !== index) {
      //     return true;
      //   }
      // });

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          pages
        }
      });
    },
    updatePubliOptionsInFields() {
      this.new_width = this.publications_options.width;
      this.new_height = this.publications_options.height;

      this.new_template = this.publication.template;
      this.new_style = this.publications_options.style;

      this.new_gridstep = this.publications_options.gridstep;
      this.new_snap_to_grid = this.publications_options.snap_to_grid;
      this.new_margin_left = this.publications_options.margin_left;
      this.new_margin_right = this.publications_options.margin_right;
      this.new_margin_top = this.publications_options.margin_top;
      this.new_margin_bottom = this.publications_options.margin_bottom;
      this.new_header_left = this.publications_options.header_left;
      this.new_header_right = this.publications_options.header_right;
      this.new_show_page_number = this.publications_options.show_page_number;
    },
    // onScroll(event) {
    //   if (this.$root.state.dev_mode === "debug") {
    //     console.log(`METHODS • Publication: onScroll`);
    //   }

    //   if (
    //     !this.$refs.hasOwnProperty("pages") ||
    //     this.$refs.pages.children.length === 0
    //   ) {
    //     return;
    //   }

    //   const currentScroll = event.target.scrollTop;
    //   const middleOfScreen = this.$refs.panel.offsetHeight / 2;
    //   let pages = this.$refs.pages.children;

    //   let index = 0;
    //   for (let page of pages) {
    //     if (
    //       page.offsetTop + page.offsetHeight >
    //       currentScroll + middleOfScreen
    //     ) {
    //       break;
    //     }
    //     index++;
    //   }

    //   this.number_of_page_currently_active = index;
    // },

    publicationKeyListener(evt) {
      switch (evt.key) {
        case "p":
        // this.preview_mode = !this.preview_mode;
      }
    },
    toggleFullscreen() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • PagePublication: toggleFullscreen`);
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
    updatePublicationOption(event, type) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • Publication: updatePublicationOption with type = ${type} and value = ${event}`
        );
      }

      let val = "";
      if (typeof event === "object") {
        val = event.target.value;
      } else {
        val = event;
      }

      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          [type]: val
        }
      });
    },
    updatePageSizeAccordingToPanel() {
      const panel_width = this.$refs.panel.offsetWidth;
      const current_page_el = this.$refs.current_page;
      if (current_page_el && panel_width > 0) {
        const page = current_page_el[0].getElementsByClassName("m_page")[0];

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
