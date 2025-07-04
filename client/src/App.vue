<template>
  <div id="app">
    <!-- <button
      type="button"
      :disabled="$api.connected"
      @click="$api.reconnectSocket"
    >
      connect
    </button>
    <button
      type="button"
      :disabled="!$api.connected"
      @click="$api.disconnectSocket"
    >
      disconnect
    </button> -->

    <component :is="'style'">
      {{ custom_fonts_css }}
    </component>

    <LoaderSpinner v-if="router_is_loading" />
    <template v-else>
      <!-- export publication as standalone webpage -->
      <!-- static UI, no live update -->
      <router-view
        v-if="$route.meta && $route.meta.static === true"
        v-slot="{ Component }"
        :key="$route.path"
      >
        <component :is="Component" />
      </router-view>

      <!-- dynamic, regular app with live updates and logging in -->
      <FullUI v-else />
    </template>

    <portal-target name="destination" multiple />
  </div>
</template>
<script>
import FullUI from "@/FullUI.vue";

export default {
  props: {},
  components: {
    FullUI,
  },
  data() {
    return {
      router_is_loading: true,
    };
  },
  created() {},
  mounted() {
    setTimeout(() => {
      this.router_is_loading = false;
    }, 200);
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    custom_fonts_css() {
      const custom_fonts = this.$root.app_infos.custom_fonts;

      return custom_fonts.reduce((acc, font) => {
        if (!font.font_files) return acc;

        Object.entries(font.font_files).map(([font_props, filename]) => {
          let font_weight;
          let font_style;

          if (font_props === "regular-normal") {
            font_weight = 400;
            font_style = "normal";
          } else if (font_props === "regular-italic") {
            font_weight = 400;
            font_style = "italic";
          } else if (font_props === "bold-normal") {
            font_weight = 700;
            font_style = "normal";
          } else if (font_props === "bold-italic") {
            font_weight = 700;
            font_style = "italic";
          }

          const relative_path_to_file = "/" + font.path + "/" + filename;

          acc += `
@font-face {
  font-family: "${font.title}";
  font-style: ${font_style};
  font-weight: ${font_weight};
  src: url("${relative_path_to_file}") format("woff2");
}

          @font-face {
            }
          `;
        });

        return acc;
        // @font-face {
        //   font-family: "Alegreya";
        //   font-style: italic;
        //   font-weight: 400;
        //   src: local("Alegreya Italic"), local("Alegreya-Italic"),
        //     url("alegreya/alegreya-v13-latin-italic.woff2") format("woff2"),
        //     /* Chrome 26+, Opera 23+, Firefox 39+ */
        //       url("alegreya/alegreya-v13-latin-italic.woff") format("woff"); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
        // }
      }, ``);
    },
  },
  methods: {},
};
</script>
<style src="@node_modules/splitpanes/dist/splitpanes.css"></style>
<style src="@node_modules/vue-plyr/dist/vue-plyr.css"></style>
<style lang="scss">
:root {
  --spacing: 1rem;
  --mobile-breakpoint: 600px;

  --c-bleumarine: hsl(227, 63%, 41%);
  --c-bleumarine_clair: hsl(227, 63%, 81%);
  --c-bleumarine_fonce: hsl(227, 63%, 21%);
  --c-bleuvert: #52c5b9;
  --c-bleuvert_clair: hsl(174, 50%, 81%);
  --c-bleuvert_fonce: hsl(174, 50%, 41%);
  --c-orange: hsl(41, 100%, 60%);
  --c-orange_clair: #ffd892;
  --c-orange_fonce: hsl(41, 100%, 45%);
  --c-jaune: #ffe800;
  --c-rouge: #fc4b60;
  --c-rouge_clair: #ff808c;
  --c-rouge_fonce: #cc334a;

  --color-vert: #93eea1;
  --color-rouge: #ee9393;
  --color-bleu: #2c75c3;
  --color-jaune: #e7ee93;

  --c-bleu: hsl(211, 63%, 47%);
  --c-bleu_clair: hsl(211, 63%, 77%);
  --c-noir: hsl(0, 0%, 15%);

  --c-gris: hsl(195, 14%, 83%);
  --c-gris_clair: hsl(195, 14%, 97%);
  --c-gris_fonce: hsl(257, 3%, 47%);

  --c-vert: hsl(143, 69%, 55%);
  --c-vert_fonce: hsl(143, 69%, 40%);

  --dropzone-color1: transparent;
  --dropzone-color2: var(--c-noir);

  --c-bodybg: hsl(48, 19%, 98%);
  --c-bodybg: hsl(40, 20%, 94%);
  --c-bodybg: hsl(40, 0%, 94%);

  --plyr-color-main: var(--c-bleumarine);

  // --sharedfolder-bg: ;

  // from tldraw
  --body-bg: white;
  --panel-color: var(--body-bg);
  --panel-color: #fff;
  --panel-borders: 1px solid var(--panel-color);
  --panel-shadows: rgba(0, 0, 0, 0.05) 0px 0px 16px -1px,
    rgba(0, 0, 0, 0.05) 0px 0px 16px -8px,
    rgba(0, 0, 0, 0.12) 0px 0px 16px -12px, rgba(0, 0, 0, 0.08) 0px 0px 2px 0px;
  --panel-radius: 6px;

  --scrollbar-height: 1px;
  --scrollbar-padding: 3px;
  --scrollbar-border: 2px;
  --scrollbar-color: 2px;
  --c-barbgcolor: rgba(255, 255, 255, 0);
  --c-thumbcolor: black;
  --label-color: var(--c-gris_fonce);
  --border-radius: 6px;
  --border-color: var(--h-200);

  --input-font-family: inherit;
  --input-font-size: 1rem;
  --input-font-size-x-small: 0.6rem;
  --input-font-size-small: 0.8rem;
  --input-font-size-big: 1.2rem;
  --input-font-weight: inherit;
  --input-height: 2em;
  --input-height-large: 3em;
  // --input-height-big: 3em;
  --input-height-small: 1.6rem;

  --input-color: var(--body-color);
  --input-border-color: var(--c-gris_fonce);
  --input-border-color-focus: var(--active-color);
  --input-border-width: 3px;
  --input-border-radius: 4px;
  --input-bg-color: var(--color-white);
  --input-box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.05);
  --input-readonly-bg-color: var(--component-bg-color);
  --input-range-track-color: var(--component-bg-color);
  --input-range-track-box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.05);
  --input-range-thumb-color: var(--color-primary);
  --input-range-thumb-height: 2rem;

  --input-invalid-color: var(--state-danger);
  --input-invalid-border-color: var(--state-danger);
  --input-valid-color: var(--state-success);
  --input-valid-border-color: var(--state-success);

  --color-capture: var(--c-rouge);
  --color-collect: var(--c-orange);
  --color-make: var(--c-bleumarine);
  --color-publish: var(--c-bleuvert);

  --indicator-color: var(--c-vert) !important;
  --active-color: var(--r-500);

  --sl-font-sans: "Archivo";
  --sl-font-serif: "IBM Plex Serif";
  --sl-font-mono: "IBM Plex Mono";

  --padding: var(--spacing);

  $sizes: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900;

  --sl-font-size-normal: 1rem;

  --sl-font-size-large: 1.2rem;
  --sl-font-size-x-large: 1.4rem;
  --sl-font-size-xx-large: 2rem;

  --sl-font-size-small: 0.875rem;
  --sl-font-size-x-small: 0.75rem;

  --font-verysmall: var(--sl-font-size-x-small);

  --max-column-width: 90%;

  accent-color: var(--c-rouge);

  // --chutier-bg: rgb(37, 39, 41);
  // --chutier-bg: #77757c;

  --b-200: #a8d2fc;
  --y-200: #f6efae;
  --y-400: #ffbc00;
  --gr-200: #a5c8a3;
  --p-200: #feddf2;
  --o-200: #e99072;

  --g-50: hsl(0, 0%, 97%);
  --g-100: hsl(0, 0%, 95%);
  --g-200: hsl(0, 0%, 87%);
  --g-300: hsl(0, 0%, 82%);
  --g-400: hsl(0, 0%, 77%);
  --g-500: hsl(0, 0%, 70%);
  --g-600: hsl(0, 0%, 60%);
  --g-700: hsl(0, 0%, 51%);
  --g-900: hsl(0, 0%, 30%);

  --r-200: #ffe08a;
  --r-500: #ffbc00;
  --r-600: #e8ab00;
  --r-900: #6b4f00;

  // --h-50: #f6f6fa;
  // --h-100: #e4e3ee;
  // --h-200: #d7d6e6;
  // --h-500: #a8a5c8;
  // --h-600: #9996b6;
  // --h-700: #77758e;
  // --h-900: #474554;
  --h-50: var(--g-50);
  --h-100: var(--g-100);
  --h-200: var(--g-200);
  --h-300: var(--g-300);
  --h-400: var(--g-400);
  --h-500: var(--g-500);
  --h-600: var(--g-600);
  --h-700: var(--g-700);
  --h-900: var(--g-900);

  // --g-50: #f6f6fa;

  --chutier-bg: var(--h-900);
}

*,
*::before,
*::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body {
  // background: white;
  // background-color: var(--c-bodybg);
  // background: linear-gradient(180deg, #fff, var(--c-bodybg));
  // background: linear-gradient(180deg, var(--c-bodybg), var(--c-gris));
  background: var(--body-bg);
  scroll-behavior: smooth;
}

::selection {
  // background: hsla(211, 63%, 77%, 0.5);
  // background: hsla(174, 70%, 71%, 0.5);
  background: hsl(246, 18%, 65%, 0.2);
}

html {
  height: 100%;

  font-family: var(--sl-font-sans);
  font-style: normal;
  font-weight: 400;

  font-size: 100%;
  line-height: 1.41;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--g-900);
  color: black;
}
body {
  min-height: 100%;
  height: 100%;
}

a {
  color: var(--h-900);
  text-underline-offset: 0.1em;

  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus-visible {
    text-decoration: none;
    color: var(--h-600);
  }
}

h1 {
}

button {
  appearance: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

#app {
  /* font-family: "Work Sans"; */
  height: 100%;
  min-height: 100%;
}

.u-inputBorder {
  --inputcol: var(--h-500);

  display: flex;
  flex-flow: row nowrap;
  border: 1px solid var(--inputcol);
  border-radius: 4px;
  // max-width: 420px;

  ._prefix,
  ._suffix {
    display: flex;
    padding: 0.3rem 0.6rem 0.3rem;
    background: var(--inputcol);
    color: var(--h-200);

    transition: all 0.1s;
  }

  &:has(input:focus-visible) {
    --inputcol: var(--h-700);
  }

  input {
    background: transparent;
    border: none !important;
    color: var(--h-700);

    &::placeholder {
      font-style: italic;
      color: var(--inputcol);
      font-size: var(--sl-font-size-small);
    }

    &:hover,
    &:focus-visible {
    }
  }
}

hr {
  margin-top: calc(var(--spacing) * 1);
  margin-bottom: calc(var(--spacing) * 1);
  border: none;
  border-top: 1px solid var(--c-gris);
}

.authorLabel {
  flex-basis: auto;
  display: flex;
  align-items: center;
  min-height: 0;
  border-radius: 4px;
  background-color: #e5e5e5;
  color: #666;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
}

body {
  margin: 0;
}

b,
strong {
  font-weight: 700;
}

h1,
h2,
h3 {
  margin: calc(var(--spacing) * 1) 0;
  font-size: var(--sl-font-size-x-large);
  line-height: 1.2;
  font-weight: normal;

  &:first-child {
    margin-top: 0;
  }
}

h3 {
  font-size: var(--sl-font-size-large);
}

h4 {
  margin: 0;
  font-size: var(--sl-font-size-normal);
  line-height: 1.2;
  font-weight: 400;
}
p {
  margin: 0;
}

.card-header {
  ul {
    margin: 0;
    padding: 0 calc(var(--spacing) / 2);
  }
}

ul,
ol {
  // margin: calc(var(--spacing) / 1);
  padding: 0;
  margin: 0;

  li {
    // margin: calc(var(--spacing) / 4);
  }
}

._importFileZone {
  .u-button {
    background-color: var(--r-200);
    color: var(--h-900);
    gap: calc(var(--spacing) / 4);
  }
}

._boldBtn {
  font-weight: 700;
  font-variant: small-caps;
}

small {
  font-size: var(--sl-font-size-small);
}
smaller {
  font-size: var(--sl-font-size-x-small);
}
img {
  max-width: 100%;
  height: auto;
}
</style>
<style lang="scss">
.alertify-logs {
  z-index: 100000;
  pointer-events: none !important;
  > * {
    pointer-events: none !important;
  }
}

.splitpanes__pane {
  // box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
  // border-radius: 4px;
  // overflow: hidden;
  position: relative;
  height: auto;
  // transition: none !important;
}

.splitpanes:not(.splitpanes--dragging) {
  transition: all 0.15s cubic-bezier(0.19, 1, 0.22, 1);
}

.splitpanes .splitpanes__splitter {
  position: relative;
  background-color: transparent;
  // border-left: 1px solid #eee;
  z-index: 11;
  border: 0px;

  pointer-events: none;
}

.splitpanes--vertical > .splitpanes__splitter {
  width: 2px;
  margin-left: -1px;

  border-right: 1px solid var(--r-600);
}
.splitpanes--horizontal > .splitpanes__splitter {
  height: 1px;
  border-bottom: 1px solid var(--r-600);
}

.splitpanes__splitter::before {
  content: "";
  position: absolute;
  width: 1rem;
  height: 100%;
  left: calc(50% - 0.4rem);
  top: 0;

  transition: opacity 0.4s;
  // background-color: rgba(255, 255, 0, 1);
  opacity: 1;
  z-index: 10;
  pointer-events: auto;
  cursor: pointer;
  cursor: -webkit-grab;
  cursor: -moz-grab;
}

.splitpanes--dragging .splitpanes__splitter {
  border-style: dashed;
}

.splitpanes--dragging .splitpanes__splitter::before {
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
}

.splitpanes__splitter:hover:before {
  // opacity: 1;
}
.splitpanes--vertical > .splitpanes__splitter::before {
}
.splitpanes--horizontal > .splitpanes__splitter::before {
}

.splitpanes__splitter:after {
  // content: "";
  // position: absolute;
  // top: auto;
  // bottom: auto;
  // top: calc(50% - 10px);
  // pointer-events: none;
  // // top: 50%;

  // transform: rotate(0deg);

  // width: 5px;
  // height: 20px;
  // left: -2px;

  // transition: transform 0.4s;
  // background-color: var(--c-bleuvert);
  // opacity: 1;
  // z-index: 11;
}
.splitpanes__splitter:hover {
  border-style: dashed;
}
.splitpanes__splitter:hover:after {
  opacity: 1;
  transform: rotate(90deg);
}
.splitpanes--horizontal > .splitpanes__splitter:after {
  transform: rotate(135deg);
  left: 50%;
}
.splitpanes--horizontal > .splitpanes__splitter:hover:after {
  transform: rotate(180deg);
}

.fade {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transition: opacity 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    transition: opacity 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
.fade_fast {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transition: opacity 0.125s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    transition: opacity 0.125s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
.fade_superfast {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transition: opacity 0.055s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    transition: opacity 0.055s cubic-bezier(0.19, 1, 0.22, 1);
  }
}

.pagechange {
  &-enter-active,
  &-leave-active {
    transform: translateY(0);
    opacity: 1;
    transition: all 0.15s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    transform: translateY(5px);
    opacity: 0;
    transition: all 0.15s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
.slideup {
  &-enter-active,
  &-leave-active {
    transform: translateY(0);
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    transform: translateY(100%);
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
.slideleft {
  &-enter-active,
  &-leave-active {
    transform: translateX(0);
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    transform: translateX(-100%);
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
.slideupFade {
  &-enter-active,
  &-leave-active {
    transform: translateY(0);
    opacity: 1;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    transform: translateY(100%);
    opacity: 0;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
.slidedown {
  &-enter-active,
  &-leave-active {
    transform: translateY(0);
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    transform: translateY(-100%);
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
.dropzone {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    // transform: translateY(0);
    transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    // transform: scale(0.9);
    transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
.StoryModules {
  &-enter-active,
  &-leave-active,
  &-move {
    transition: 0.5s cubic-bezier(0.19, 1, 0.22, 1) !important;
    transition-property: opacity, transform;
    transform-origin: center top;
  }
  &-enter,
  &-leave-to {
    opacity: 0;
  }
  &-enter-to {
    opacity: 1;
  }
  &-leave-active {
    position: absolute !important;
  }
}

.enableMode {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transform: scale(1);
    transition: all 0.15s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    transform: scale(1.5);
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }
}

.scaleInFade {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transform: scale(1);
    transform-origin: center center;
    transition: all 0.15s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    transform: scale(0.95);
    opacity: 0;
  }
}
.scaleOutFade {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transform: scale(1);
    transform-origin: center center;
    transition: all 0.15s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    transform: scale(1.05);
    opacity: 0;
  }
}
.toggleLock {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transform: scale(1);
    transform-origin: center center;
    transition: all 0.15s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    transform: scale(0.5);
    opacity: 0;
  }
}
.popUp_slow {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transform: scale(1);
    transform-origin: center center;
    transition: all 0.55s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    transform: scale(0);
    opacity: 0;
  }
}
.scaleInFade_fast {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transform: scale(1);
    transform-origin: center center;
    transition: all 0.05s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    transform: scale(0.95);
    opacity: 0;
  }
}
.onionSkin {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transition: all 0.02s linear;
  }
  &-enter,
  &-leave-to {
    opacity: 0;
  }
}

.listComplete {
  &-move {
    position: relative;
    transition: transform 0.25s cubic-bezier(0.19, 1, 0.22, 1),
      opacity 0.2s cubic-bezier(0.19, 1, 0.22, 1) !important;
  }

  &-leave-active {
    position: absolute !important;
    z-index: -1 !important;
  }
  &-enter,
  &-leave-to {
    opacity: 0;
  }
}

.mediaModal {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter {
    transform: scale(0.97);
    opacity: 0;
  }
  &-leave-to {
    opacity: 0;
  }
}
.justCaptured {
  &-enter-active {
    transition: transform 0.35s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter {
    transform: scale(1.03);
    // transform: scale(1.03) translateY(2rem);
  }

  &-leave-active {
    transition: opacity 0.15s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-leave-to {
    opacity: 0;
  }
}

.projectsList-move {
  position: relative;
  transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1),
    opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1) !important;
}
.projectsList-enter,
.projectsList-leave-to {
  opacity: 0;
}
.projectsList-leave-active {
  opacity: 0;
  position: absolute !important;
  z-index: 0 !important;

  transition: none !important;
}

@keyframes background-position {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.anim_backgroundPosition {
  background-color: var(--active-color);
  animation: background-position 2s infinite;
  animation-timing-function: ease-in-out;
  animation-fill-mode: forwards;
  animation-direction: alternate;
}
.Vue-Toastification__toast--success {
  background-color: var(--c-bleuvert) !important;
}
.Vue-Toastification__toast--error {
  background-color: var(--c-rouge) !important;
}
.Vue-Toastification__toast--warning {
  background-color: var(--c-orange) !important;
}
.Vue-Toastification__toast--info {
  background-color: var(--c-gris_fonce) !important;
}
</style>
