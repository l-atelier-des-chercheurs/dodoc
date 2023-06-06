<template>
  <div class="_chutierPane">
    <sl-button
      class="_closeBtn"
      variant="neutral"
      size="medium"
      circle
      @click="$emit('close')"
    >
      <sl-icon name="x-lg" :label="$t('close')"></sl-icon>
    </sl-button>
    <slot />
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
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
<style lang="scss" scoped>
._chutierPane {
  position: absolute;
  z-index: 10;
  top: -2px;
  width: 100%;
  height: 100%;
  overflow: auto;

  background: var(--chutier-bg);
  padding: calc(var(--spacing) / 2);

  border-top: 2px solid black;
}

._closeBtn {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px;
}
</style>
