<template>
  <sl-card class="u-card">
    <div slot="header" v-if="$slots['header']" class="u-label">
      <slot name="header" />
    </div>
    <slot />
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
<style lang="scss" scoped></style>
