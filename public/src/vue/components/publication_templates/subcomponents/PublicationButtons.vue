<template>
  <div class="m_publicationButtons">
    <button
      class="button"
      @mousedown.stop.prevent="$emit('createPubliText')"
      @touchstart.stop.prevent="$emit('createPubliText')"
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
      @mousedown.stop.prevent="$emit('createPubliText')"
      @touchstart.stop.prevent="$emit('createPubliText')"
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
      <span>{{ $t("square") }}</span>
    </button>
    <button
      class="button"
      @mousedown.stop.prevent="$emit('createPubliText')"
      @touchstart.stop.prevent="$emit('createPubliText')"
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
</template>
<script>
export default {
  props: {},
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
