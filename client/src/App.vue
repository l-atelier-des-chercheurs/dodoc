-
<template>
  <div id="app" class="">
    <SocketStatus />

    <div class="">
      <router-view />
    </div>
  </div>
</template>
<script>
import SocketStatus from "./components/SocketStatus.vue";

export default {
  props: {},
  components: {
    SocketStatus,
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
:root {
  /* Fonts */
  --spacing: 0.9rem;
  --border-width: 1pt;
  --border-color: #222;
  --page-height: 11in;
  --active-color: rgb(52, 122, 213);

  --c-orange: #f9ca00;
  --c-rouge: #ff3e51;
  --c-bleu: hsl(211, 63%, 47%);
  --c-noir: #333;
  --c-gris: #eff2f3;
  --c-vert: hsl(143, 69%, 55%);
  --c-vert_fonce: hsl(143, 69%, 40%);

  --active-color: var(--c-orange);
  /* --active-color: #aaa; */
  --color-WriteUp: #fff;

  --color-MediaLibrary: var(--c-orange);
  --color-Composition: var(--c-bleu);
  --color-Capture: var(--c-rouge);
  --color-Journal: var(--c-gris);
  --color-Team: var(--c-vert);

  --scrollbar-height: 1px;
  --scrollbar-padding: 3px;
  --scrollbar-border: 2px;
  --c-barbgcolor: rgba(255, 255, 255, 0);
  --c-thumbcolor: black;

  $sizes: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900;

  @each $size in $sizes {
    $i: index($sizes, $size);
    --sl-color-success-#{$size}: hsl(143, 69%, #{82% - $i * 5});
  }
  @each $size in $sizes {
    $i: index($sizes, $size);
    --sl-color-primary-#{$size}: hsl(211, 63%, #{98% - $i * 5});
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
}

* {
  box-sizing: border-box;
}

html,
body {
  background: white;
}
html {
  height: 100%;
}
body {
  min-height: 100%;
}

#app {
  /* font-family: "Work Sans"; */
  font-family: "IBM Plex Sans";
  font-style: normal;
  font-weight: 300;

  font-size: 85%;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--c-noir);

  min-height: 100%;
}

hr {
  border-top: 1px solid var(--c-noir);
  border-bottom: 0 solid #000;
}

body {
  margin: 0;
}

b,
strong {
  font-weight: bold;
}

.pageContent {
  padding: var(--spacing);
}

[contenteditable] {
  outline: 1px solid gray;
}
h1 {
  margin: 0;
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
  width: 30px;
  height: 30px;

  left: calc(50% - 15px);
  top: calc(50% - 15px);

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

  width: 2px;
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

.splitpanes--vertical > .splitpanes__splitter:after {
  // left: -10px;
  // right: -10px;
  // height: 100%;
}
.splitpanes--horizontal > .splitpanes__splitter:after {
  transform: rotate(135deg);
  left: 50%;
  // top: -10px;
  // bottom: -10px;
  // width: 100%;
}
.splitpanes--horizontal > .splitpanes__splitter:hover:after {
  transform: rotate(180deg);
}
</style>
