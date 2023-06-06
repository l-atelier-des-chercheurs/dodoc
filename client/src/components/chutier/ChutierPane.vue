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
  background: var(--chutier-bg);
  padding: calc(var(--spacing) / 2);
}
</style>
