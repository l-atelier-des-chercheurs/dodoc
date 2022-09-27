-
<template>
  <div id="app" class="">
    <TopBar />
    <AdminPanel v-if="false" />

    <div class="">
      <router-view />
    </div>
  </div>
</template>
<script>
import AdminPanel from "@/adc-core/AdminPanel.vue";
import TopBar from "@/components/TopBar.vue";

export default {
  props: {},
  components: {
    AdminPanel,
    TopBar,
  },
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
<style src="../node_modules/splitpanes/dist/splitpanes.css"></style>
<style lang="scss">
@import "@/utils/utils.scss";

:root {
  --spacing: var(--sl-spacing-medium);

  --c-bleumarine: #1d327f;
  --c-bleuvert: #52c5b9;
  --c-orange: #ffbe32;
  --c-rouge: #fc4b60;
  --c-bleu: hsl(211, 63%, 47%);
  --c-bleu_clair: hsl(211, 63%, 77%);
  --c-noir: #333;
  --c-gris: #eff2f3;
  --c-gris_fonce: hsl(195, 14%, 75%);
  --c-vert: hsl(143, 69%, 55%);
  --c-vert_fonce: hsl(143, 69%, 40%);

  --active-color: var(--c-orange);

  --c-bodybg: #f4f3ef;

  --scrollbar-height: 1px;
  --scrollbar-padding: 3px;
  --scrollbar-border: 2px;
  --c-barbgcolor: rgba(255, 255, 255, 0);
  --c-thumbcolor: black;
  --border-radius: 10px;

  --input-font-family: inherit;
  --input-font-size: var(--font-size);
  --input-font-size-small: 0.8rem;
  --input-font-size-big: 1.2rem;
  --input-font-weight: inherit;
  --input-height: 3rem;
  --input-height-big: 2.75rem;
  --input-height-small: 1.5rem;
  --input-color: var(--body-color);
  --input-border-color: var(--c-gris_fonce);
  --input-border-color-focus: var(--active-color);
  --input-border-width: 3px;
  --input-border-radius: 3px;
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

  --color-Capturer: var(--c-rouge);
  --color-Collecter: var(--c-orange);
  --color-Remixer: var(--c-bleuvert);
  --color-Documenter: var(--c-bleumarine);

  --indicator-color: var(--c-vert) !important;

  --sl-font-sans: "Fira Sans";
  --sl-font-serif: "IBM Plex Serif";
  --sl-font-mono: "Fira Mono";

  $sizes: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900;

  @each $size in $sizes {
    $i: index($sizes, $size);
    --sl-color-success-#{$size}: hsl(143, 69%, #{82% - $i * 5});
  }
  @each $size in $sizes {
    $i: index($sizes, $size);
    --sl-color-primary-#{$size}: hsl(221, 63%, #{98% - $i * 5});
  }
  @each $size in $sizes {
    $i: index($sizes, $size);
    --sl-color-warning-#{$size}: hsl(36, 96%, #{90% - $i * 5});
  }
  @each $size in $sizes {
    $i: index($sizes, $size);
    --sl-color-info-#{$size}: hsl(0, 0%, #{88% - $i * 0.5});
  }

  --sl-input-color: black;
  --sl-input-height-small: 1.5rem;
  --sl-font-size-x-large: 1.66rem;
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body {
  background: white;
  background-color: var(--c-bodybg);
  accent-color: var(--c-vert);
}

::selection {
  background: var(--c-bleu_clair);
}

html {
  height: 100%;

  font-family: "Fira Sans";
  font-style: normal;
  font-weight: 400;

  font-size: 100%;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--c-noir);
}
body {
  min-height: 100%;
}

a {
  color: var(--c-bleu);
  text-underline-offset: 0.1em;

  &:hover {
    text-decoration: none;
  }
}

button {
  appearance: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

#app {
  /* font-family: "Work Sans"; */

  min-height: 100%;
}

hr {
  border-top: 1px solid var(--c-noir);
  border-bottom: 0 solid #000;
}

._metaField {
  display: flex;
  // flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
}

body {
  margin: 0;
}

b,
strong {
  font-weight: 700;
}

h1 {
  margin: 0;
}
h2 {
}

.card-header {
  ul {
    margin: 0;
    padding: 0 calc(var(--spacing) / 2);
  }
}

._boldBtn {
  font-weight: 700;
  font-variant: small-caps;
}
img {
  max-width: 100%;
  height: auto;
}
</style>
<style lang="scss">
.splitpanes__pane {
  // box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
  // border-radius: 4px;
  // overflow: hidden;
  transition: none !important;
}

.splitpanes .splitpanes__splitter {
  position: relative;
  background-color: transparent;
  // border-left: 1px solid #eee;
  z-index: 100;
  border: 0px;

  pointer-events: none;
}

.splitpanes--vertical > .splitpanes__splitter {
  width: 1px;
  margin-left: -1px;
  border-right: 1px solid black;
}
.splitpanes--horizontal > .splitpanes__splitter {
  height: 1px;
  border-bottom: 1px solid black;
}

.splitpanes__splitter:before {
  content: "";
  position: absolute;
  width: 40px;
  height: 40px;

  left: calc(50% - 20px);
  top: calc(50% - 20px);

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
  content: "";
  position: absolute;
  top: auto;
  bottom: auto;
  top: calc(50% - 10px);
  pointer-events: none;
  // top: 50%;

  transform: rotate(45deg);

  width: 3px;
  height: 20px;

  transition: transform 0.4s;
  background-color: #000;
  opacity: 1;
  z-index: 11;
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
    transition: opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    transition: opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
.fade_fast {
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
</style>
