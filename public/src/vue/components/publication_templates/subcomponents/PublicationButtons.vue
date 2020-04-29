<template>
  <div class="m_publicationButtons">
    <div>
      <label>
        <button
          type="button"
          class="button-nostyle text-uc button-triangle"
          :class="{ 'is--active': show_create_options }"
          @click="show_create_options = !show_create_options"
        >
          {{ $t("create") }}
        </button>
      </label>
      <div v-if="show_create_options">
        <button
          class="button"
          @mousedown.stop.prevent="$emit('addMedia', { type: 'text' })"
          @touchstart.stop.prevent="$emit('addMedia', { type: 'text' })"
        >
          <svg
            version="1.1"
            class="inline-svg inline-svg-larger"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="168px"
            height="168px"
            viewBox="0 0 168 168"
            style="enable-background: new 0 0 168 168;"
            xml:space="preserve"
          >
            <path
              style="fill: #52c5b9;"
              d="M84,168c46.4,0,84-37.6,84-84c0-46.4-37.6-84-84-84C37.6,0,0,37.6,0,84C0,130.4,37.6,168,84,168z"
            />
            <rect
              x="79.4"
              y="52.1"
              style="fill: #1b2f81;"
              width="62.3"
              height="15"
            />
            <rect
              x="79.4"
              y="79.5"
              style="fill: #1b2f81;"
              width="62.3"
              height="15"
            />
            <rect
              x="79.4"
              y="107"
              style="fill: #1b2f81;"
              width="62.3"
              height="15"
            />

            <path
              style="fill: #1b2f81;"
              d="M21.2,52.1h49v15H53.7V122H37.6V67.1H21.2V52.1z"
            />
          </svg>
          <span>{{ $t("text") }}</span>
        </button>
        <button
          class="button"
          @mousedown.stop.prevent="
            $emit('addMedia', { type: 'line', stroke_color: '#1d327f' })
          "
          @touchstart.stop.prevent="
            $emit('addMedia', { type: 'line', stroke_color: '#1d327f' })
          "
        >
          <!-- Generator: Adobe Illustrator 24.1.0, SVG Export Plug-In  -->
          <svg
            version="1.1"
            class="inline-svg inline-svg-larger"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="168px"
            height="168px"
            viewBox="0 0 168 168"
            style="enable-background: new 0 0 168 168;"
            xml:space="preserve"
          >
            <path
              style="fill: #52c5b9;"
              d="M84,168c46.4,0,84-37.6,84-84c0-46.4-37.6-84-84-84C37.6,0,0,37.6,0,84C0,130.4,37.6,168,84,168z"
            />
            <line
              x1="42"
              y1="84"
              x2="126"
              y2="84"
              style="
                fill: none;
                stroke: #1b2f81;
                stroke-width: 15;
                stroke-miterlimit: 10;
              "
            />
          </svg>
          <span>{{ $t("line") }}</span>
        </button>
        <button
          class="button"
          @mousedown.stop.prevent="
            $emit('addMedia', { type: 'arrow', stroke_color: '#1d327f' })
          "
          @touchstart.stop.prevent="
            $emit('addMedia', { type: 'arrow', stroke_color: '#1d327f' })
          "
        >
          <!-- Generator: Adobe Illustrator 24.1.0, SVG Export Plug-In  -->
          <svg
            version="1.1"
            class="inline-svg inline-svg-larger"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="168px"
            height="168px"
            viewBox="0 0 168 168"
            style="enable-background: new 0 0 168 168;"
            xml:space="preserve"
          >
            <path
              style="fill: #52c5b9;"
              d="M84,168c46.4,0,84-37.6,84-84c0-46.4-37.6-84-84-84C37.6,0,0,37.6,0,84C0,130.4,37.6,168,84,168z"
            />
            <line
              x1="42"
              y1="84"
              x2="126"
              y2="84"
              style="
                fill: none;
                stroke: #1b2f81;
                stroke-width: 15;
                stroke-miterlimit: 40;
              "
            />
            <line
              x1="126"
              y1="84"
              x2="93"
              y2="51"
              style="
                fill: none;
                stroke: #1b2f81;
                stroke-width: 15;
                stroke-miterlimit: 10;
              "
            />
            <line
              x1="126"
              y1="84"
              x2="93"
              y2="117"
              style="
                fill: none;
                stroke: #1b2f81;
                stroke-width: 15;
                stroke-miterlimit: 10;
              "
            />
          </svg>
          <span>{{ $t("arrow") }}</span>
        </button>
        <button
          class="button"
          @mousedown.stop.prevent="
            $emit('addMedia', { type: 'rectangle', stroke_color: '#1d327f' })
          "
          @touchstart.stop.prevent="
            $emit('addMedia', { type: 'rectangle', stroke_color: '#1d327f' })
          "
        >
          <!-- Generator: Adobe Illustrator 24.1.0, SVG Export Plug-In  -->
          <svg
            version="1.1"
            class="inline-svg inline-svg-larger"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="168px"
            height="168px"
            viewBox="0 0 168 168"
            style="enable-background: new 0 0 168 168;"
            xml:space="preserve"
          >
            <path
              style="fill: #52c5b9;"
              d="M84,168c46.4,0,84-37.6,84-84c0-46.4-37.6-84-84-84C37.6,0,0,37.6,0,84C0,130.4,37.6,168,84,168z"
            />
            <rect
              x="56"
              y="56"
              style="
                fill: none;
                stroke: #1b2f81;
                stroke-width: 13;
                stroke-miterlimit: 10;
              "
              width="56"
              height="56"
            />
          </svg>
          <span>{{ $t("rectangle") }}</span>
        </button>
        <button
          class="button"
          @mousedown.stop.prevent="
            $emit('addMedia', { type: 'ellipsis', stroke_color: '#1d327f' })
          "
          @touchstart.stop.prevent="
            $emit('addMedia', { type: 'ellipsis', stroke_color: '#1d327f' })
          "
        >
          <!-- Generator: Adobe Illustrator 24.1.0, SVG Export Plug-In  -->
          <svg
            version="1.1"
            class="inline-svg inline-svg-larger"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="168px"
            height="168px"
            viewBox="0 0 168 168"
            style="enable-background: new 0 0 168 168;"
            xml:space="preserve"
          >
            <path
              style="fill: #52c5b9;"
              d="M84,168c46.4,0,84-37.6,84-84c0-46.4-37.6-84-84-84C37.6,0,0,37.6,0,84C0,130.4,37.6,168,84,168z"
            />
            <circle
              style="
                fill: none;
                stroke: #1b2f81;
                stroke-width: 15;
                stroke-miterlimit: 10;
              "
              cx="84"
              cy="84"
              r="41.8"
            />
          </svg>
          <span>{{ $t("ellipsis") }}</span>
        </button>
      </div>
    </div>
    <div v-if="media">
      <label>
        {{ $t("edit") }}
      </label>
      <div>
        <div
          class="item"
          v-if="media.type === 'text' || media.publi_meta.type === 'text'"
        >
          <label>{{ $t("font_size") }}</label>
          <div>
            <input
              type="range"
              min="0"
              max="300"
              step="10"
              v-model="font_size_percent"
            />
          </div>
          <label>{{ font_size_percent }}%</label>
        </div>

        <div
          class="item"
          v-if="
            media.publi_meta.type !== 'line' &&
            media.publi_meta.type !== 'arrow' &&
            media.type !== 'image'
          "
        >
          <label>{{ $t("fill_color") }}</label>
          <div>
            <input type="color" v-model="fill_color" />
          </div>
        </div>
        <div class="item">
          <label>{{ $t("stroke_color") }}</label>
          <div>
            <input type="color" v-model="stroke_color" />
          </div>
        </div>

        <div class="item m_customStyles">
          <label>{{ $t("css_settings") }}</label>
          <PrismEditor
            v-model="custom_css"
            @change="/* setCSSForMedia */"
            language="css"
          />
          <div class="m_customStyles--sendButton">
            <button
              type="button"
              class="button-greenthin"
              @click="updateMediaPubliMeta({ custom_css: custom_css })"
              :class="{}"
            >
              {{ $t("send") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import PrismEditor from "vue-prism-editor";

export default {
  props: {
    preview_mode: Boolean,
    slugPubliName: String,
    page_medias: Array,
  },
  components: {
    PrismEditor,
  },
  data() {
    return {
      show_create_options: true,
      custom_css: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    "$root.settings.current_publication.selected_medias": function () {
      if (this.$root.settings.current_publication.selected_medias.length > 0) {
        this.show_create_options = false;
      } else this.show_create_options = true;
    },
    media: function () {
      this.custom_css = this.media.publi_meta.hasOwnProperty("custom_css")
        ? this.media.publi_meta.custom_css
        : this.custom_css;
    },
  },
  computed: {
    media() {
      if (this.$root.settings.current_publication.selected_medias.length === 0)
        return false;

      const all_selected_medias = this.$root.settings.current_publication.selected_medias.reduce(
        (acc, meta) => {
          const corresponding_media = this.page_medias.find(
            (m) => m.publi_meta.metaFileName === meta
          );
          if (corresponding_media) acc.push(corresponding_media);
          return acc;
        },
        []
      );

      return all_selected_medias[0];
    },

    font_size_percent: {
      get() {
        return this.media.publi_meta.hasOwnProperty("font_size_percent") &&
          !!Number.parseFloat(this.media.publi_meta.font_size_percent)
          ? Number.parseFloat(this.media.publi_meta.font_size_percent)
          : 100;
      },
      set(value) {
        this.updateMediaPubliMeta({ font_size_percent: value });
      },
    },
    stroke_color: {
      get() {
        return this.media.publi_meta.hasOwnProperty("stroke_color") &&
          !!this.media.publi_meta.stroke_color
          ? this.media.publi_meta.stroke_color
          : "transparent";
      },
      set(value) {
        this.updateMediaPubliMeta({ stroke_color: value });
      },
    },
    fill_color: {
      get() {
        return this.media.publi_meta.hasOwnProperty("fill_color") &&
          !!this.media.publi_meta.fill_color
          ? this.media.publi_meta.fill_color
          : "transparent";
      },
      set(value) {
        this.updateMediaPubliMeta({ fill_color: value });
      },
    },
  },
  methods: {
    updateMediaPubliMeta(val) {
      this.$root.editMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName: this.media.publi_meta.metaFileName,
        data: val,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
