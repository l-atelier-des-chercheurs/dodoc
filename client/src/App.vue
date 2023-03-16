-
<template>
  <div id="app" class="">
    <DisconnectModal v-if="show_disconnect_modal" />

    <div class="_spinner" v-if="$root.is_loading" key="loader">
      <LoaderSpinner />
    </div>

    <template v-else>
      <GeneralPasswordModal
        v-if="show_general_password_modal"
        @close="show_general_password_modal = false"
      />

      <template v-else>
        <transition name="fade" mode="out-in">
          <div class="">
            <TopBar v-if="$route.name !== 'Publication'" />

            <transition name="fade_fast" mode="out-in">
              <router-view v-slot="{ Component }" :key="$route.path">
                <component :is="Component" />
              </router-view>
            </transition>

            <TaskTracker />
          </div>
        </transition>
      </template>
    </template>

    <portal-target name="destination" />
  </div>
</template>
<script>
import TopBar from "@/components/TopBar.vue";
import GeneralPasswordModal from "@/adc-core/modals/GeneralPasswordModal.vue";
import TaskTracker from "@/adc-core/tasks/TaskTracker.vue";
import DisconnectModal from "@/adc-core/modals/DisconnectModal.vue";

export default {
  props: {},
  components: {
    TopBar,
    GeneralPasswordModal,
    TaskTracker,
    DisconnectModal,
  },
  data() {
    return {
      show_general_password_modal: false,
      show_disconnect_modal: false,
    };
  },
  created() {
    this.$eventHub.$on(
      `app.prompt_general_password`,
      this.promptGeneralPassword
    );
    this.$eventHub.$on("socketio.disconnect", this.showDisconnectModal);
  },
  mounted() {},
  beforeDestroy() {
    this.$eventHub.$off(
      `app.prompt_general_password`,
      this.promptGeneralPassword
    );
  },
  watch: {},
  computed: {},
  methods: {
    showDisconnectModal() {
      this.show_disconnect_modal = true;
    },
    promptGeneralPassword() {
      this.show_general_password_modal = true;
    },
  },
};
</script>
<style src="../node_modules/splitpanes/dist/splitpanes.css"></style>
<style src="../node_modules/vue-plyr/dist/vue-plyr.css"></style>
<style lang="scss">
@import "@/utils/utils.scss";

:root {
  --spacing: var(--sl-spacing-medium);

  --c-bleumarine: hsl(227, 63%, 41%);
  --c-bleumarine_clair: hsl(227, 63%, 81%);
  --c-bleumarine_fonce: hsl(227, 63%, 11%);
  --c-bleuvert: #52c5b9;
  --c-bleuvert_clair: hsl(174, 50%, 81%);
  --c-bleuvert_fonce: hsl(174, 50%, 41%);
  --c-orange: #ffbe32;
  --c-orange_clair: #ffd892;
  --c-orange_fonce: hsl(41, 100%, 45%);
  --c-rouge: #fc4b60;
  --c-rouge_clair: #ff808c;
  --c-rouge_fonce: #cc334a;

  --c-bleu: hsl(211, 63%, 47%);
  --c-bleu_clair: hsl(211, 63%, 77%);
  --c-noir: hsl(0, 0%, 15%);
  --c-gris: hsl(195, 14%, 93%);
  --c-gris_clair: hsl(195, 14%, 97%);
  --c-gris_fonce: hsl(195, 14%, 45%);
  --c-vert: hsl(143, 69%, 55%);
  --c-vert_fonce: hsl(143, 69%, 40%);

  --c-bodybg: hsl(48, 19%, 95%);
  --c-bodybg: hsl(48, 19%, 98%);
  --c-bodybg: hsl(40, 20%, 94%);
  // --c-bodybg: white;
  --body-bg-pattern-color: hsl(48, 19%, 93%);
  --plyr-color-main: var(--c-bleumarine);

  // from tldraw
  --panel-color: #fefefe;
  --panel-borders: 1px solid white;
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

  --input-font-family: inherit;
  --input-font-size: 1rem;
  --input-font-size-small: 0.8rem;
  --input-font-size-big: 1.2rem;
  --input-font-weight: inherit;
  --input-height: 2.5em;
  --input-height-large: 3em;
  // --input-height-big: 3em;
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

  --color-capture: var(--c-rouge);
  --color-collect: var(--c-orange);
  --color-remix: var(--c-bleumarine);
  --color-publish: var(--c-bleuvert);

  --indicator-color: var(--c-vert) !important;
  --active-color: var(--c-bleuvert);

  --sl-font-sans: "Fira Sans";
  --sl-font-serif: "IBM Plex Serif";
  --sl-font-mono: "Fira Mono";

  --padding: var(--spacing);

  $sizes: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900;

  @each $size in $sizes {
    // vert
    // $i: index($sizes, $size);
    // --sl-color-success-#{$size}: hsl(143, 69%, #{82% - $i * 5});
    // bleuvert
    $i: index($sizes, $size);
    --sl-color-success-#{$size}: hsl(174, 60%, #{82% - $i * 5});
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
  --sl-font-size-x-large: 1.66rem;
  --sl-font-size-xx-large: 2rem;

  --max-column-width: 140ch;

  accent-color: var(--c-orange);
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body {
  // background: white;
  background-color: var(--c-bodybg);
  scroll-behavior: smooth;
  // diagonal lines
  // background-size: 6px 6px;
  // background-image: repeating-linear-gradient(
  //   45deg,
  //   var(--body-bg-pattern-color) 0,
  //   var(--body-bg-pattern-color) 0.6000000000000001px,
  //   var(--c-bodybg) 0,
  //   var(--c-bodybg) 50%
  // );

  // cross
  // background: radial-gradient(
  //     circle,
  //     transparent 20%,
  //     var(--c-bodybg) 20%,
  //     var(--c-bodybg) 80%,
  //     transparent 80%,
  //     transparent
  //   ),
  //   radial-gradient(
  //       circle,
  //       transparent 20%,
  //       var(--c-bodybg) 20%,
  //       var(--c-bodybg) 80%,
  //       transparent 80%,
  //       transparent
  //     )
  //     15px 15px,
  //   linear-gradient(
  //       var(--body-bg-pattern-color) 1.2000000000000002px,
  //       transparent 1.2000000000000002px
  //     )
  //     0 -0.6000000000000001px,
  //   linear-gradient(
  //       90deg,
  //       var(--body-bg-pattern-color) 1.2000000000000002px,
  //       var(--c-bodybg) 1.2000000000000002px
  //     ) -0.6000000000000001px 0;
  // background-size: 30px 30px, 30px 30px, 15px 15px, 15px 15px;
}

::selection {
  background: hsla(211, 63%, 77%, 0.5);
}

html {
  height: 100%;

  font-family: "Fira Sans";
  font-style: normal;
  font-weight: 400;

  font-size: 90%;

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

.metaField {
  // display: flex;
  // flex-flow: row wrap;
  // gap: calc(var(--spacing) / 2);
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

h1 {
  margin: 0;
  font-size: var(--sl-font-size-xx-large);
}
h2 {
  margin: 0;
  font-size: var(--sl-font-size-x-large);
}
h3 {
  margin: 0;
  font-size: var(--sl-font-size-large);
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

._boldBtn {
  font-weight: 700;
  font-variant: small-caps;
}

small {
  font-size: var(--sl-font-size-small);
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
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
.StoryModules {
  &-enter-active,
  &-leave-active,
  &-move {
    transition: 0.7s cubic-bezier(0.19, 1, 0.22, 1) !important;
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
    position: absolute;
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
    transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1),
      opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1) !important;
  }

  &-leave-active {
    position: absolute;
    z-index: 0 !important;
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
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter {
    transform: scale(0.95);
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
</style>
