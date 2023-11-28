<template>
  <div class="_metaField">
    <DLabel :str="$t('resolution')" />
    <div>
      <template v-if="width">
        {{ width }}
      </template>
      <template v-else> – </template>
      ×
      <template v-if="height">
        {{ height }}
      </template>
      <template v-else> – </template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    width: Number,
    height: Number,
  },
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
<style lang="scss">
._metaField {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: calc(var(--spacing) / 16);
}
</style>
