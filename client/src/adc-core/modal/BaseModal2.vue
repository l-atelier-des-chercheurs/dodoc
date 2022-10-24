<template>
  <dialog @click="possiblyClose">
    <header>
      <h2>{{ title }}</h2>
    </header>
    <div class="_content">
      <slot />
    </div>
    <div class="_footer"></div>
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
        this.$emit("close");
      }
    },
  },
};
</script>
<style lang="scss" scoped>
dialog {
  width: 100%;
  max-width: 400px;

  background-color: #fff;
  border: none;
  padding: 0;
  border-radius: var(--border-radius);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  &::backdrop {
    background: rgba(53, 53, 53, 0.7);
  }

  &[open],
  &::backdrop {
    animation: show 500ms ease;
  }
}

header {
  padding: var(--spacing) calc(var(--spacing) * 1.5);
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
}

@keyframes show {
  0% {
    opacity: 0;
  }
}
</style>
