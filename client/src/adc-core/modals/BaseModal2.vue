<template>
  <dialog @cancel.prevent="closeModal" @click.self="possiblyClose">
    <header v-if="title">
      <h2>{{ title }}</h2>
    </header>
    <div class="_content">
      <slot />
    </div>
    <div class="_footer">
      <slot name="footer" />
    </div>
  </dialog>
</template>
<script>
export default {
  props: {
    title: String,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {
    this.$el.showModal();
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    possiblyClose(event) {
      const rect = this.$el.getBoundingClientRect();
      if (
        event.clientY < rect.top ||
        event.clientY > rect.bottom ||
        event.clientX < rect.left ||
        event.clientX > rect.right
      ) {
        this.closeModal();
      }
    },
    closeModal() {
      this.$el.close();
      setTimeout(() => {
        this.$emit("close");
      }, 400);
    },
  },
};
</script>
<style lang="scss" scoped>
dialog {
  width: 100%;
  max-width: 480px;
  z-index: 1000;

  background-color: #fff;
  border: none;
  padding: 0;
  border-radius: var(--border-radius);
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.5);

  &::backdrop {
    background: rgba(53, 53, 53, 0.7);
  }

  &[open] {
    animation: reveal 400ms cubic-bezier(0.19, 1, 0.22, 1);
  }
  &::backdrop {
  }
}

header {
  padding: calc(var(--spacing) * 1.5);
  border-bottom: 2px solid #e5e5e5;
  width: 100%;
  h2 {
    font-weight: 700;
    font-size: var(--sl-font-size-x-large);
    margin: 0;
  }
}

._content {
  padding: var(--spacing) calc(var(--spacing) * 1.5);

  > *:first-child {
    margin-top: 0;
  }
}
._footer {
  text-align: center;
}

@keyframes reveal {
  0% {
    opacity: 0;
    transform: translate(0, 30px);
  }
}
</style>
