<template>
  <div class="_projectCard">
    <!-- <sl-card class="u-card"> -->
    <div slot="header" v-if="$slots['header']" class="u-label">
      <slot name="header" />
    </div>
    <slot />
    <!-- </sl-card> -->
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
._projectCard {
  // border: 1px solid #000;
  // border-bottom: 0;
  padding: calc(var(--spacing) * 1) 0;

  &:last-child {
    // border-bottom: 1px solid #000;
  }
}
</style>
