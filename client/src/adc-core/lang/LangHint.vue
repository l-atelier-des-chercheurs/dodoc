<template>
  <div>
    <transition name="langhint">
      <div
        v-if="show_hint"
        class="_langHint"
        role="status"
        @mouseenter="is_paused = true"
        @mouseleave="is_paused = false"
        @focusin="is_paused = true"
        @focusout="is_paused = false"
      >
        <b-icon icon="globe" class="_langHint--icon" />
        <div class="_langHint--content">
          <span class="_langHint--text" v-text="$t('ui_lang_select')" />
          <!-- each lang is written in its own lang, readable by those who
          can't read the current one -->
          <LangSelector @change="langPicked" />
        </div>
        <button
          type="button"
          class="u-button u-button_icon u-button_small _langHint--close"
          :title="$t('close')"
          @click="dismiss"
        >
          <b-icon icon="x" :aria-label="$t('close')" />
        </button>
        <!-- closes the hint when it ends, paused while hovered/focused -->
        <span
          class="_langHint--timer"
          :class="{ 'is--paused': is_paused }"
          @animationend="show_hint = false"
        />
      </div>
    </transition>
  </div>
</template>
<script>
import LangSelector from "@/adc-core/lang/LangSelector.vue";

// shown to first-time visitors, so they know the language can be changed
// without the topbar having to keep a button for it. Stops showing once they
// pick a lang, close it, or navigate (the current lang suits them then): if it
// just times out, it comes back on the next visit
const SEEN_KEY = "lang_hint_seen";

export default {
  components: {
    LangSelector,
  },
  data() {
    return {
      show_hint: false,
      is_paused: false,
    };
  },
  mounted() {
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch (e) {
      return;
    }
    // let the page settle before sliding in
    this.show_timeout = setTimeout(() => (this.show_hint = true), 1500);
  },
  beforeDestroy() {
    clearTimeout(this.show_timeout);
  },
  watch: {
    $route() {
      this.markAsSeen();
    },
  },
  methods: {
    langPicked() {
      this.dismiss();
      // show where this setting lives from now on
      this.$eventHub.$emit("toolbar.bumpLangSetting");
    },
    dismiss() {
      this.show_hint = false;
      this.markAsSeen();
    },
    markAsSeen() {
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch (e) {
        /**/
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._langHint {
  position: fixed;
  top: calc(var(--spacing) * 4.5);
  right: var(--spacing);
  z-index: 10;

  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  max-width: calc(100vw - var(--spacing) * 2);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2)
    calc(var(--spacing) / 2) calc(var(--spacing) / 1);
  overflow: hidden;

  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

._langHint--icon {
  flex: 0 0 auto;
  font-size: 1.4rem;
  color: var(--c-bleumarine);
}

._langHint--content {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 3);
}

._langHint--text {
  line-height: 1.3;
}

._langHint--close {
  flex: 0 0 auto;
}

._langHint--timer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background: var(--c-bleumarine_clair);
  transform-origin: left center;
  animation: langhint-timer 10s linear forwards;

  &.is--paused {
    animation-play-state: paused;
  }
}

@keyframes langhint-timer {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.langhint-enter-active,
.langhint-leave-active {
  transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}
.langhint-enter,
.langhint-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
