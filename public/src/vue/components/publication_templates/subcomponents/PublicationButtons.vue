<template>
  <div class="m_publicationButtons">
    <div class="m_publicationButtons--content">
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
          <small>
            {{ $t("import_medias_from_projects_or_create_shapes_here") }}
          </small>
          <div>
            <button
              class="button _create_buttons"
              @mousedown.stop.prevent="
                $emit('addMedia', {
                  type: 'text',
                  stroke_color: stroke_color !== '' ? stroke_color : '',
                  fill_color: fill_color !== '' ? fill_color : '',
                  stroke_width: stroke_width,
                })
              "
              @touchstart.stop.prevent="
                $emit('addMedia', {
                  type: 'text',
                  stroke_color: stroke_color !== '' ? stroke_color : '',
                  fill_color: fill_color !== '' ? fill_color : '',
                  stroke_width: stroke_width,
                })
              "
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
          </div>
          <div>
            <button
              class="button _create_buttons"
              @mousedown.stop.prevent="
                $emit('addMedia', {
                  type: 'line',
                  stroke_color: stroke_color !== '' ? stroke_color : '#1d327f',
                  stroke_width: stroke_width,
                })
              "
              @touchstart.stop.prevent="
                $emit('addMedia', {
                  type: 'line',
                  stroke_color: stroke_color !== '' ? stroke_color : '#1d327f',
                  stroke_width: stroke_width,
                })
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
          </div>
          <div>
            <button
              class="button _create_buttons"
              @mousedown.stop.prevent="
                $emit('addMedia', {
                  type: 'arrow',
                  stroke_color: stroke_color !== '' ? stroke_color : '#1d327f',
                  stroke_width: stroke_width,
                })
              "
              @touchstart.stop.prevent="
                $emit('addMedia', {
                  type: 'arrow',
                  stroke_color: stroke_color !== '' ? stroke_color : '#1d327f',
                  stroke_width: stroke_width,
                })
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
          </div>
          <div>
            <button
              class="button _create_buttons"
              @mousedown.stop.prevent="
                $emit('addMedia', {
                  type: 'rectangle',
                  stroke_color:
                    stroke_color !== ''
                      ? stroke_color
                      : fill_color !== ''
                      ? ''
                      : '#1d327f',
                  fill_color: fill_color !== '' ? fill_color : '',
                  stroke_width: stroke_width,
                })
              "
              @touchstart.stop.prevent="
                $emit('addMedia', {
                  type: 'rectangle',
                  stroke_color:
                    stroke_color !== ''
                      ? stroke_color
                      : fill_color !== ''
                      ? ''
                      : '#1d327f',
                  fill_color: fill_color !== '' ? fill_color : '',
                  stroke_width: stroke_width,
                })
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
          </div>
          <div>
            <button
              class="button _create_buttons"
              @mousedown.stop.prevent="
                $emit('addMedia', {
                  type: 'ellipsis',
                  stroke_color:
                    stroke_color !== ''
                      ? stroke_color
                      : fill_color !== ''
                      ? ''
                      : '#1d327f',
                  fill_color: fill_color !== '' ? fill_color : '',
                  stroke_width: stroke_width,
                })
              "
              @touchstart.stop.prevent="
                $emit('addMedia', {
                  type: 'ellipsis',
                  stroke_color:
                    stroke_color !== ''
                      ? stroke_color
                      : fill_color !== ''
                      ? ''
                      : '#1d327f',
                  fill_color: fill_color !== '' ? fill_color : '',
                  stroke_width: stroke_width,
                })
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
      </div>
      <div>
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_edit_options }"
            @click="show_edit_options = !show_edit_options"
          >
            {{ $t("edit") }}
          </button>
        </label>
        <template v-if="show_edit_options">
          <div v-if="!media">
            <small class>{{
              $t("click_on_a_bloc_to_edit_its_presentation")
            }}</small>
          </div>
          <div v-else>
            <div
              class="item"
              v-if="
                media.type === 'text' ||
                (media.hasOwnProperty('_linked_media') &&
                  media._linked_media.type === 'text')
              "
            >
              <label>{{ $t("font_size") }}</label>
              <div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="1"
                  v-model="font_size_percent"
                />
              </div>
              <div class="input-group">
                <input
                  type="number"
                  class="input-small"
                  v-model="font_size_percent"
                />
                <span class="input-addon input-addon-small">%</span>
              </div>
            </div>

            <div
              class="item"
              v-if="
                media.type !== 'line' &&
                media.type !== 'arrow' &&
                (!media.hasOwnProperty('_linked_media') ||
                  media._linked_media.type !== 'image')
              "
            >
              <label>
                {{ $t("fill_color") }}
                <button
                  type="button"
                  class="buttonLink padding-verysmall margin-none"
                  v-if="fill_color !== ''"
                  @click="fill_color = ''"
                >
                  ×
                </button>
              </label>
              <div>
                <input
                  type="color"
                  v-model="fill_color"
                  :novalue="fill_color === ''"
                />
              </div>
            </div>
            <div class="item">
              <label>
                {{ $t("stroke_color") }}
                <button
                  type="button"
                  class="buttonLink padding-verysmall margin-none"
                  v-if="stroke_color !== ''"
                  @click="stroke_color = ''"
                >
                  ×
                </button>
              </label>
              <div>
                <input
                  type="color"
                  v-model="stroke_color"
                  :novalue="stroke_color === ''"
                />
              </div>
            </div>

            <div class="item" v-if="stroke_color !== ''">
              <label>{{ $t("stroke_width") }}</label>
              <div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  v-model="stroke_width"
                />
              </div>
              <div class="input-group">
                <input
                  type="number"
                  class="input-small"
                  v-model="stroke_width"
                />
                <span class="input-addon input-addon-small">pt</span>
              </div>
            </div>

            <div class="item">
              <label>{{ $t("layer_order") }}</label>
              <div>
                <small>{{ $t("layer_order_instructions") }}</small>
                {{ mediaZIndex }}
                <button
                  type="button"
                  class="buttonLink _no_underline"
                  @mousedown.stop.prevent="editZIndex(+1)"
                  @touchstart.stop.prevent="editZIndex(+1)"
                  :content="
                    $t('move_to_foreground') +
                    '<br>' +
                    $t('layer:') +
                    ' ' +
                    mediaZIndex
                  "
                  v-tippy="{
                    placement: 'top',
                    delay: [600, 0],
                  }"
                >
                  <svg
                    version="1.1"
                    class="inline-svg"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    width="40.3px"
                    height="59.6px"
                    viewBox="0 0 40.3 59.6"
                    style="enable-background: new 0 0 40.3 59.6;"
                    xml:space="preserve"
                  >
                    <path
                      class="st0"
                      d="M35,24.4l-4.6-4.2c-2.7-2.5-4.8-4.7-6.4-7.3l0,46.7l-7.7,0l0-46.6c-1.7,2.5-3.8,4.7-6.4,7.1l-4.6,4.2L0,18.1
              L20.2,0l20.2,18.1L35,24.4z"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  class="buttonLink _no_underline"
                  @mousedown.stop.prevent="editZIndex(-1)"
                  @touchstart.stop.prevent="editZIndex(-1)"
                  :content="
                    $t('move_to_background') +
                    '<br>' +
                    $t('layer:') +
                    ' ' +
                    mediaZIndex
                  "
                  v-tippy="{
                    placement: 'top',
                    delay: [600, 0],
                  }"
                >
                  <svg
                    version="1.1"
                    class="inline-svg"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    width="40.3px"
                    height="59.6px"
                    viewBox="0 0 40.3 59.6"
                    style="enable-background: new 0 0 40.3 59.6;"
                    xml:space="preserve"
                  >
                    <path
                      class="st0"
                      d="M5.3,35.2l4.6,4.2c2.7,2.5,4.8,4.7,6.4,7.3l0-46.7L24,0l0,46.6c1.7-2.5,3.8-4.7,6.4-7.1l4.6-4.2l5.3,6.2
              L20.2,59.6L0,41.5L5.3,35.2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div class="item m_customStyles">
              <label>
                <button
                  type="button"
                  class="button-nostyle text-uc button-triangle"
                  :class="{ 'is--active': show_custom_css }"
                  @click.stop="show_custom_css = !show_custom_css"
                >
                  {{ $t("css_settings") }}
                </button>
              </label>
              <div v-if="show_custom_css">
                <PrismEditor
                  v-model="custom_css"
                  @change="/* setCSSForMedia */"
                  language="css"
                  ref="prismEditor"
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
        </template>
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
      show_edit_options: true,
      show_custom_css: false,
      custom_css: "",
    };
  },
  created() {},
  mounted() {
    this.updateMediaStyles();
  },
  beforeDestroy() {},
  watch: {
    "$root.settings.current_publication.selected_medias": function () {
      if (this.$root.settings.current_publication.selected_medias.length > 0) {
        this.show_edit_options = true;
      }
      // this.show_create_options = false;
      // this.show_create_options = true;
    },
    media: {
      handler: function () {
        if (this.media) {
          this.custom_css = this.media.hasOwnProperty("custom_css")
            ? this.media.custom_css
            : "";
          if (!!this.custom_css) {
            this.show_custom_css = true;
          }
        }
      },
      deep: true,
    },
    show_custom_css() {
      if (this.show_custom_css) {
        this.$nextTick(() => {
          if (
            this.$refs.prismEditor &&
            this.$refs.prismEditor.$el.firstElementChild
          )
            this.$refs.prismEditor.$el.firstElementChild.focus();
        });
      }
    },
  },
  computed: {
    media() {
      if (
        this.$root.settings.current_publication.selected_medias.length === 0 ||
        !Array.isArray(this.page_medias) ||
        this.page_medias.length === 0
      )
        return false;

      const all_selected_medias = this.$root.settings.current_publication.selected_medias.reduce(
        (acc, meta) => {
          const corresponding_media = this.page_medias.find(
            (m) => m.metaFileName === meta
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
        return this.media &&
          this.media.hasOwnProperty("font_size_percent") &&
          !!Number.parseFloat(this.media.font_size_percent)
          ? Number.parseFloat(this.media.font_size_percent)
          : 100;
      },
      set(value) {
        if (value > 90 && value < 110) value = 100;
        this.updateMediaPubliMeta({ font_size_percent: value });
      },
    },
    stroke_color: {
      get() {
        return this.media &&
          this.media.hasOwnProperty("stroke_color") &&
          !!this.media.stroke_color
          ? this.media.stroke_color
          : "";
      },
      set(value) {
        this.updateMediaPubliMeta({ stroke_color: value });
      },
    },
    fill_color: {
      get() {
        return this.media &&
          this.media.hasOwnProperty("fill_color") &&
          !!this.media.fill_color
          ? this.media.fill_color
          : "";
      },
      set(value) {
        this.updateMediaPubliMeta({ fill_color: value });
      },
    },
    stroke_width: {
      get() {
        return this.media &&
          this.media.hasOwnProperty("stroke_width") &&
          !!Number.parseFloat(this.media.stroke_width)
          ? Number.parseFloat(this.media.stroke_width)
          : 4;
      },
      set(value) {
        this.updateMediaPubliMeta({ stroke_width: value });
      },
    },
    mediaZIndex() {
      return this.media && this.media.hasOwnProperty("z_index")
        ? this.media.z_index
        : 0;
    },
  },
  methods: {
    updateMediaPubliMeta(val) {
      if (!this.media) return;
      this.$root.editMedia({
        type: "publications",
        slugFolderName: this.slugPubliName,
        slugMediaName: this.media.metaFileName,
        data: val,
      });
    },
    editZIndex(val) {
      this.$eventHub.$emit("publication.flashZIndex");
      this.updateMediaPubliMeta({
        z_index: this.mediaZIndex + val,
      });
    },
    updateMediaStyles() {},
  },
};
</script>
<style lang="scss" scoped></style>
