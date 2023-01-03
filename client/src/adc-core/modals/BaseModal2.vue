<template>
  <portal to="destination">
    <transition name="fade">
      <div class="_baseModal" v-if="show_modal" @click.self="closeModal">
        <div class="_baseModal--content">
          <header v-if="title">
            <h2>{{ title }}</h2>
          </header>
          <div class="_content">
            <slot />
          </div>
          <div class="_footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </portal>
</template>
<script>
export default {
  props: {
    title: String,
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
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    closeModal() {
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
  background: rgba(53, 53, 53, 0.7);

  ._baseModal--content {
    background-color: #fff;
    border-radius: var(--border-radius);
    box-shadow: 0 1px 12px rgba(0, 0, 0, 0.5);
    margin: 0 auto;
    max-width: 480px;
    width: 100%;
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
