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
          <header v-if="title">
            <h2>{{ title }}</h2>
          </header>
          <div class="_content" v-if="$slots.hasOwnProperty('default')">
            <slot />
          </div>
          <div class="_footer" v-if="$slots.hasOwnProperty('footer')">
            <slot name="footer" />
          </div>
        </div>
        <div class="_baseModal--closeBtn" v-if="is_closable">
          <sl-button variant="neutral" size="medium" circle @click="closeModal">
            <sl-icon name="x-lg" :label="$t('close')"></sl-icon>
          </sl-button>
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
    // padding: calc(var(--spacing) / 2);
    background: var(--panel-color);
    border: var(--panel-borders);
    // box-shadow: var(--panel-shadows);
    // border-radius: var(--panel-radius);

    margin: 0 auto;
    max-width: 480px;
    width: 100%;
    // height: 100%;
    max-height: calc(100vh - calc(var(--spacing) * 2));
    overflow: auto;
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
}

._baseModal--closeBtn {
  position: absolute;
  top: 0;
  right: 0;
  padding: 2px;
}

header {
  padding: calc(var(--spacing) * 1);
  border-bottom: 2px solid #e5e5e5;
  width: 100%;
  h2 {
    font-weight: 600;
    font-size: var(--sl-font-size-x-large);
    margin: 0;
  }
}

._content {
  height: 100%;
  padding: var(--spacing) calc(var(--spacing) * 1);

  > *:first-child {
    margin-top: 0;
  }

  ._baseModal[data-size="full"] & {
    padding: 0;
  }
}
._footer {
  text-align: center;
  padding: var(--spacing) calc(var(--spacing) * 1);
}

@keyframes reveal {
  0% {
    opacity: 0;
    transform: translate(0, 30px);
  }
}
</style>
