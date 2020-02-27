<template>
  <div
    class="m_publicationview--pages--pageContainer"
    :style="setPageContainerProperties(page)"
  >
    <div class="m_page" :style="setPageProperties(page)">
      <template v-if="!preview_mode">
        <div
          v-for="(item, index) in [0, 1, 2, 3]"
          class="m_page--margins_rule"
          :style="
            `--margin_left: ${page.margin_left}mm; --margin_right: ${page.margin_right}mm; --margin_top: ${page.margin_top}mm; --margin_bottom: ${page.margin_bottom}mm;`
          "
          :key="index"
        />

        <div
          class="m_page--grid"
          v-if="!!page.gridstep && page.gridstep > 0"
          :style="
            `
            --gridstep: ${page.gridstep}mm; 
            --margin_left: ${page.margin_left}mm; 
            --margin_right: ${page.margin_right}mm; 
            --margin_top: ${page.margin_top}mm; 
            --margin_bottom: ${page.margin_bottom}mm;
            --zoom: ${zoom};
          `
          "
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
      >
        {{ pageNumber + 1 }}
      </div>

      <div v-if="publication_medias.length === 0" class="m_page--noMedia">
        <template v-if="this.$root.state.mode !== 'print_publication'">
          {{ $t("no_media_on_this_page") }}
        </template>
      </div>

      <div
        v-else
        v-for="media in publication_medias"
        :key="media.publi_meta.metaFileName"
      >
        <MediaPublication
          :page="page"
          :mode="mode"
          :media="media"
          :preview_mode="preview_mode"
          :read_only="read_only"
          :pixelsPerMillimeters="pixelsPerMillimeters"
          @removePubliMedia="
            values => {
              removePubliMedia(values);
            }
          "
          @editPubliMedia="
            values => {
              editPubliMedia(values);
            }
          "
          @unselected="noSelection"
        />
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
      default: -1
    },
    page: Object,
    publication_medias: {
      type: Array,
      default: () => []
    },
    read_only: Boolean,
    pixelsPerMillimeters: Number,
    zoom: Number
  },
  components: {
    MediaPublication
  },
  data() {
    return {};
  },
  created() {},
  mounted() {
    if (this.mode === "single") {
      if (this.page.hasOwnProperty("id"))
        this.$root.settings.current_publication.page_id = this.page.id;
      this.$root.settings.current_publication.accepted_media_type = [
        "image",
        "video",
        "audio",
        "text",
        "document",
        "other"
      ];
    }
  },
  beforeDestroy() {
    this.$root.settings.current_publication.page_id = false;
    this.$root.settings.current_publication.accepted_media_type = [];
  },
  watch: {},
  computed: {
    customCSSVars() {
      return `--current-time-human: "${this.$root.currentTime_human}"`;
    }
  },
  methods: {
    setPageContainerProperties(page) {
      if (this.$root.state.mode === "print_publication") return;

      return `
        width: ${page.width * this.zoom}mm;
        height: ${page.height * this.zoom}mm;
      `;
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
          transform: scale(${this.zoom});
        `;
      }
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
        slugMediaName
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
        data: val
      });
    },

    noSelection() {
      this.has_media_selected = false;
    }
  }
};
</script>
<style lang="scss"></style>
