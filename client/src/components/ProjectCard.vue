<template>
  <sl-card class="_projectCard u-card">
    <!-- <sl-card class="u-card"> -->
    <header slot="header" v-if="$slots['header']" class="">
      <slot name="header" />
    </header>
    <slot />
    <!-- </sl-card> -->
  </sl-card>
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
  // padding: calc(var(--spacing) * 1) 0;
  // margin: calc(var(--spacing) / 2);

  &:last-child {
    // border-bottom: 1px solid #000;
  }
}
</style>
