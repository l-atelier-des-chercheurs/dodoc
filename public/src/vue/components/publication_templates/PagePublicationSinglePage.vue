<template>
  <div class="m_publicationview--pages--pageContainer">
    <div :style="setPageContainerProperties(page)">
      <div
        class="m_page"
        :style="setPageProperties(page)"
        @mousedown.self="
          $root.settings.current_publication.selected_medias = []
        "
        @touchstart.self="
          $root.settings.current_publication.selected_medias = []
        "
      >
        <template v-if="!preview_mode">
          <div
            v-for="(pos, index) in ['left', 'right', 'top', 'bottom']"
            v-if="page['margin_' + pos] > 0"
            class="m_page--margins_rule"
            :class="['m_page--margins_rule_' + pos]"
            :style="`--margin_${pos}: ${page['margin_' + pos]}mm`"
            :key="index"
          ></div>

          <div
            class="m_page--grid"
            v-if="!!page.gridstep && page.gridstep > 0"
            :style="`
            --gridstep: ${page.gridstep}mm; 
            --margin_left: ${page.margin_left}mm; 
            --margin_right: ${page.margin_right}mm; 
            --margin_top: ${page.margin_top}mm; 
            --margin_bottom: ${page.margin_bottom}mm;
            --zoom: ${zoom};
          `"
          />
        </template>

        <div
          class="m_page--header"
          :style="customCSSVars"
          v-if="!!page.header_left || !!page.header_right"
        >
          <div>{{ page.header_left }}</div>
          <div>{{ page.header_right }}</div>
        </div>

        <div
          v-if="
            pageNumber >= 0 &&
            (!page.hasOwnProperty('show_page_number') || page.show_page_number)
          "
          class="m_page--pageNumber"
          :class="{ toRight: true }"
        >{{ pageNumber + 1 }}</div>

        <div v-if="publication_medias.length === 0" class="m_page--noMedia">
          <template
            v-if="
              ![
                'export_publication',
                'print_publication',
                'link_publication',
              ].includes($root.state.mode)
            "
          >{{ $t("no_media_on_this_page") }}</template>
        </div>
        <div v-else v-for="media in publication_medias" :key="media.metaFileName">
          <transition name="MediaPublication" :duration="500">
            <div>
              <MediaPublication
                :key="media.metaFileName"
                :page="page"
                :mode="mode"
                :media="media"
                :preview_mode="preview_mode"
                :read_only="read_only"
                :pixelsPerMillimeters="pixelsPerMillimeters"
                :zoom="zoom"
                :publi_is_model="publi_is_model"
                :model_for_this_publication="model_for_this_publication"
                :slugPubliName="slugPubliName"
                @removePubliMedia="(values) => removePubliMedia(values)"
                @editPubliMedia="(values) => editPubliMedia(values)"
                @duplicateMedia="(values) => duplicateMedia(values)"
              />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import MediaPublication from "../subcomponents/MediaPublication.vue";

export default {
  props: {
    mode: String,
    preview_mode: Boolean,
    slugPubliName: String,
    pageNumber: {
      type: Number,
      default: -1,
    },
    page: Object,
    publication_medias: {
      type: Array,
      default: () => [],
    },
    read_only: Boolean,
    pixelsPerMillimeters: Number,
    zoom: Number,
    publi_is_model: Boolean,
    model_for_this_publication: [Boolean, Object],
  },
  components: {
    MediaPublication,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {
    if (this.mode === "single") {
      this.$root.settings.current_publication.selected_medias = [];
      this.$root.settings.current_publication.accepted_media_type = [
        "image",
        "video",
        "audio",
        "text",
        "stl",
        "document",
        "other",
      ];
    }
  },
  beforeDestroy() {
    if (this.mode === "single") {
      this.$root.settings.current_publication.selected_medias = [];
      this.$root.settings.current_publication.accepted_media_type = [];
    }
  },
  watch: {},
  computed: {
    customCSSVars() {
      return `--current-time-human: "${this.$root.currentTime_human}"`;
    },
  },
  methods: {
    setPageContainerProperties(page) {
      if (this.$root.state.mode === "print_publication") return;

      let css = `
        transform: scale(${this.zoom});
        transform-origin: left top;
      `;

      if (this.mode === "contact_sheet")
        return (css += `
          width: ${page.width * this.zoom}mm;
          height: ${page.height * this.zoom}mm;
        `);
      if (this.mode === "single")
        return (css += `
          width: ${page.width}mm;
          height: ${page.height}mm;
          margin: 40px;
          padding: 40px ${140 / this.zoom}px ${100 * this.zoom}px ${240 /
          this.zoom}px;  
          box-sizing: content-box;
        `);

      if (this.mode === "export")
        return (css += `
          width: ${page.width}mm;
          height: ${page.height}mm;
          margin: 1em auto;
        `);

      return css;
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
    removePubliMedia({ metaFileName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • Publication: removeMedia / slugMediaName = ${metaFileName}`
        );
      }

      this.$root.removeMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName: metaFileName,
      });
    },
    // function to update property of a media inside medias_list
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
    duplicateMedia({ metaFileName }) {
      this.$root
        .copyMediaToFolder({
          type: "publications",
          from_slugFolderName: this.slugPubliName,
          to_slugFolderName: this.slugPubliName,
          slugMediaName: metaFileName,
        })
        .then(mdata => {
          const x = mdata.x ? mdata.x + 5 : 20;
          const y = mdata.y ? mdata.y + 5 : 20;
          const z_index = mdata.z_index ? mdata.z_index + 1 : 1;

          this.editPubliMedia({
            slugMediaName: mdata.metaFileName,
            val: {
              x,
              y,
              z_index,
            },
          });

          this.$eventHub.$emit(
            "publication.selectNewMedia",
            mdata.metaFileName
          );
        });
    },
  },
};
</script>
<style lang="scss"></style>
