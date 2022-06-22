-
<template>
  <div id="app" class="bg-gray-100">
    <SocketStatus />

    <nav class="bg-gray-100 px-5 py-3 rounded-md w-full">
      <ol class="list-reset flex">
        <li>
          <router-link to="/" class="text-blue-600 hover:text-blue-700">
            Accueil
          </router-link>
        </li>
        <li><span class="text-gray-500 mx-2">/</span></li>
        <li>
          <router-link to="/projects" class="text-blue-600 hover:text-blue-700">
            Projets
          </router-link>
        </li>
        <li><span class="text-gray-500 mx-2">/</span></li>
        <li class="text-gray-500">
          <router-link to="/" class="text-blue-600 hover:text-blue-700">
            Le projet
          </router-link>
        </li>
      </ol>
    </nav>

    <div class="pageContent">
      <details>
        <summary>$api.store</summary>
        <pre>{{ $api.store }}</pre>
      </details>

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
<style lang="postcss">
:root {
  /* Fonts */
  --sl-font-mono: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  --sl-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
  --sl-font-serif: Georgia, "Times New Roman", serif;

  --spacing: 0.9rem;
  --border-width: 1pt;
  --border-color: #222;
  --page-height: 11in;
  --active-color: rgb(52, 122, 213);

  --c-orange: #f9ca00;
  --c-rouge: #ff3e51;
  --c-bleu: #2c75c5;
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

body {
  margin: 0;
}

b,
strong {
  font-weight: bold;
}

.pageContent {
  margin: var(--spacing);
}

[contenteditable] {
  outline: 1px solid gray;
}
h1 {
  margin: 0;
}
</style>
