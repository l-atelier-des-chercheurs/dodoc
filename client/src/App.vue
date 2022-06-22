-
<template>
  <div id="app" class="">
    <SocketStatus />

    <BreadCrumbs />
    <div class="">
      <router-view />
    </div>
  </div>
</template>
<script>
import SocketStatus from "./components/SocketStatus.vue";
import BreadCrumbs from "./components/nav/BreadCrumbs.vue";

export default {
  props: {},
  components: {
    SocketStatus,
    BreadCrumbs,
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
  --color-Planning: var(--c-gris);
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
