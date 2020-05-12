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
      <span>
        {{ preview_mode ? $t("edit") : $t("preview") }}
      </span>
    </button>
    <button
      class="margin-vert-verysmall font-verysmall"
      @mousedown.stop.prevent="$emit('toggleFullScreen')"
      @touchstart.stop.prevent="$emit('toggleFullScreen')"
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
      <span>
        {{ $t("fullscreen") }}
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
          style="enable-background: new 0 0 155.6 21.2;"
          xml:space="preserve"
        >
          <defs />
          <path d="M155.6,0v21.2H0V0H155.6z" />
        </svg>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    preview_mode: Boolean,
    fullscreen_mode: Boolean,
    show_zoom_buttons: {
      type: Boolean,
      default: false,
    },
    zoom: Number,
    zoom_min: Number,
    zoom_max: Number,
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
