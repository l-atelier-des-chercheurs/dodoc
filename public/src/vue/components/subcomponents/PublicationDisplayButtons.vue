<template>
  <div
    class="m_publicationSettings"
    v-if="
      !['export_publication', 'print_publication', 'link_publication'].includes(
        $root.state.mode
      )
    "
  >
    <button
      class="margin-vert-verysmall font-verysmall _preview_button"
      :class="{ 'is--active': !preview_mode }"
      @mousedown.stop.prevent="$emit('togglePreviewMode')"
      @touchstart.stop.prevent="$emit('togglePreviewMode')"
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
        style="enable-background: new 0 0 144 84"
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
      <span>
        {{ preview_mode ? $t("edit") : $t("preview") }}
      </span>
    </button>
    <div v-if="show_zoom_buttons">
      <button
        v-if="zoom"
        class="margin-vert-verysmall font-verysmall"
        :disabled="zoom === zoom_max"
        @mousedown.stop.prevent="$emit('setZoom', zoom + 0.1)"
        @touchstart.stop.prevent="$emit('setZoom', zoom + 0.1)"
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
          style="enable-background: new 0 0 182.5 188.1"
          xml:space="preserve"
        >
          <defs />
          <path
            d="M102.6,0v83.1h79.9v21.2h-79.9v83.8H79.9v-83.8H0V83.1h79.9V0H102.6z"
          />
        </svg>
      </button>
      <button
        type="button"
        @mousedown.stop.prevent="$emit('setZoom', 1)"
        @touchstart.stop.prevent="$emit('setZoom', 1)"
        :content="$t('reset')"
        v-tippy="{
          placement: 'top',
          delay: [600, 0],
        }"
      >
        <span>{{ $t("zoom") }} = {{ zoom.toFixed(1) }}</span>
      </button>
      <button
        v-if="zoom"
        class="margin-vert-verysmall font-verysmall"
        :disabled="zoom === zoom_min"
        @mousedown.stop.prevent="$emit('setZoom', zoom - 0.1)"
        @touchstart.stop.prevent="$emit('setZoom', zoom - 0.1)"
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
          viewBox="0 0 205.6 21.2"
          style="enable-background: new 0 0 155.6 21.2"
          xml:space="preserve"
        >
          <defs />
          <path d="M155.6,0v21.2H0V0H155.6z" />
        </svg>
      </button>
    </div>
    <div v-if="show_page_navigator">
      <button
        class="font-verysmall"
        :disabled="opened_page_index === 0"
        @mousedown.stop.prevent="$emit('navPage', -1)"
        @touchstart.stop.prevent="$emit('navPage', -1)"
        :content="$t('previous_page')"
        v-tippy="{
          placement: 'top',
          delay: [600, 0],
        }"
      >
        <!-- Generator: Adobe Illustrator 25.0.0, SVG Export Plug-In  -->
        <svg
          class="inline-svg inline-svg_larger"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="70.8px"
          height="65px"
          viewBox="0 0 70.8 65"
          style="overflow: visible; enable-background: new 0 0 70.8 65"
          xml:space="preserve"
        >
          <defs></defs>
          <g>
            <path
              d="M41.9,10.8l-4.6,5c-2,2.1-3.8,3.8-5.5,5.1c-1.7,1.3-3.6,2.5-5.7,3.6h44.7v15.8H26c2.2,1.1,4.1,2.3,5.7,3.6
		c1.6,1.3,3.5,3,5.5,5.1l4.6,5L29.3,65L0,32.5L29.3,0L41.9,10.8z"
            />
          </g>
        </svg>
      </button>
      <div>
        <span
          v-html="
            $t('page') +
            ' ' +
            (opened_page_index + 1) +
            '/' +
            total_number_of_pages
          "
        />
      </div>
      <button
        type="button"
        @mousedown.stop.prevent="$emit('navPage', +1)"
        @touchstart.stop.prevent="$emit('navPage', +1)"
        :content="$t('next_page')"
        v-tippy="{
          placement: 'top',
          delay: [600, 0],
        }"
      >
        <!-- Generator: Adobe Illustrator 25.0.0, SVG Export Plug-In  -->
        <svg
          class="inline-svg inline-svg_larger"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="70.8px"
          height="65px"
          viewBox="0 0 70.8 65"
          style="overflow: visible; enable-background: new 0 0 70.8 65"
          xml:space="preserve"
        >
          <path
            d="M29,54.2l4.6-5c2-2.1,3.8-3.8,5.5-5.1c1.7-1.3,3.6-2.5,5.7-3.6L0,40.4l0-15.8l44.8,0c-2.2-1.1-4.1-2.3-5.7-3.6
		c-1.6-1.3-3.5-3-5.5-5.1l-4.6-5L41.5,0l29.3,32.5L41.5,65L29,54.2z"
          />
        </svg>
      </button>
    </div>
    <div v-if="show_page_navigator">
      <button
        type="button"
        class="flex-wrap flex-vertically-centered"
        @mousedown.stop.prevent="$emit('showAllPages')"
        @touchstart.stop.prevent="$emit('showAllPages')"
        :content="$t('show_all_pages')"
        v-tippy="{
          placement: 'top',
          delay: [600, 0],
        }"
      >
        <svg
          version="1.1"
          class="inline-svg inline-svg_larger"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="169px"
          height="169px"
          viewBox="0 0 169 169"
          style="overflow: visible; enable-background: new 0 0 169 169"
          xml:space="preserve"
        >
          <rect x="34.2" y="34.2" width="44.7" height="44.7" />
          <rect x="90.1" y="34.2" width="44.7" height="44.7" />
          <rect x="34.2" y="90.1" width="44.7" height="44.7" />
          <rect x="90.1" y="90.1" width="44.7" height="44.7" />
        </svg>
        <span v-html="$t('show_all_pages')" />
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    preview_mode: Boolean,
    show_zoom_buttons: {
      type: Boolean,
      default: false,
    },
    show_page_navigator: {
      type: Boolean,
      default: false,
    },
    zoom: Number,
    zoom_min: Number,
    zoom_max: Number,
    opened_page_index: [Number, Boolean],
    total_number_of_pages: Number,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
