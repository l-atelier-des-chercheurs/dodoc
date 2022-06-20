-
<template>
  <div id="app">
    <SocketStatus />
    <details>
      <summary>$api.store</summary>
      {{ $api.store }}
    </details>

    <router-view />
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
<style lang="scss">
:root {
  /* Fonts */
  --sl-font-mono: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  --sl-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
  --sl-font-serif: Georgia, "Times New Roman", serif;
}

body {
  background: white;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-family: "Karla";
  font-style: normal;
  font-weight: 300;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

[contenteditable] {
  outline: 1px solid gray;
}
h1 {
  margin: 0;
}
</style>
