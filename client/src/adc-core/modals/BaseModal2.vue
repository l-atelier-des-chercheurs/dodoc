<template>
  <portal to="destination">
    <transition name="fade_fast">
      <div
        class="_baseModal"
        v-if="show_modal"
        @click.self="closeModal"
        ref="modal"
        :data-size="size"
      >
        <div class="_baseModal--content">
          <header v-if="title || is_closable">
            <h2 v-if="title">{{ title }}</h2>

            <button
              v-if="is_closable"
              type="button"
              class="u-button u-button_icon _closeBtn"
              @click="closeModal"
            >
              <b-icon icon="x-lg" :label="$t('close')" />
            </button>
          </header>
          <div class="_content" v-if="$slots.hasOwnProperty('default')">
            <slot />
          </div>
          <footer class="_footer" v-if="$slots.hasOwnProperty('footer')">
            <slot name="footer" />
          </footer>
          <div v-else class="_noFooterMargin" />
        </div>
      </div>
    </transition>
  </portal>
</template>
<script>
export default {
  props: {
    title: String,
    size: String,
    is_closable: {
      type: Boolean,
      default: true,
    },
  },
  components: {},
  data() {
    return {
      show_modal: false,
    };
  },
  created() {},
  mounted() {
    this.show_modal = true;
    window.addEventListener("keyup", this.handleKeyPress);

    this.$eventHub.$emit(`modal.is_opened`);

    this.$nextTick(() => {
      this.$nextTick(() => {
        if (this.$refs.modal && this.$refs.modal.querySelector("[autofocus]"))
          this.$refs.modal.querySelector("[autofocus]").focus();
      });
    });
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handleKeyPress);
    this.$eventHub.$emit(`modal.is_closed`);
  },
  watch: {},
  computed: {},
  methods: {
    handleKeyPress($event) {
      if ($event.key === "Escape") this.closeModal();
    },
    closeModal() {
      if (!this.is_closable) return false;

      this.show_modal = false;
      setTimeout(() => {
        this.$emit("close");
      }, 400);
    },
  },
};
</script>
<style lang="scss" scoped>
._baseModal {
  position: fixed;
  inset: 0;
  z-index: 10000;

  display: flex;
  justify-content: center;
  align-items: center;

  border: none;
  padding: 0;

  backdrop-filter: blur(5px);
  // background: rgba(53, 53, 53, 0.7);
  // background: rgba(255, 255, 255, 0.7);
  background: rgba(231, 231, 231, 0.7);

  ._baseModal--content {
    position: relative;
    background: var(--panel-color);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    border-radius: 4px;

    margin: 0 auto;
    width: 100%;
    max-width: 480px;
    max-height: 100vh;
    // max-width: calc(480px - calc(var(--spacing) * 1));
    // max-height: calc(100vh - calc(var(--spacing) * 1));
  }

  &[data-size="full"] ._baseModal--content {
    max-width: none;
    max-height: none;
    border: none;

    --modal-margin: var(--spacing) * 4;

    width: calc(100% - var(--modal-margin));
    height: calc(100% - var(--modal-margin));
    margin: calc(var(--modal-margin) / 2);
  }
  &[data-size="large"] ._baseModal--content {
    max-width: 680px;
  }
  &[data-size="x-large"] ._baseModal--content {
    max-width: 980px;
  }
}

._closeBtn {
  padding: calc(var(--spacing) / 3);
}

header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: calc(var(--spacing) * 1);
  h2 {
    font-weight: 600;
    font-size: var(--sl-font-size-x-large);
    margin: 0;
  }
}

._baseModal--content {
  display: flex;
  flex-flow: column nowrap;

  > header,
  footer {
    flex: 0 0 auto;
  }
  ._content {
    flex: 1 1 auto;
  }
}
._content {
  overflow: auto;
  padding: 0 calc(var(--spacing) * 1) 0;

  > *:first-child {
    margin-top: 0;
  }

  ._baseModal[data-size="full"] & {
    padding: 0;
  }
}
._footer {
  text-align: center;
  padding: calc(var(--spacing) * 1);
}

._noFooterMargin {
  margin-bottom: calc(var(--spacing) * 1);
}

@keyframes reveal {
  0% {
    opacity: 0;
    transform: translate(0, 30px);
  }
}
</style>
