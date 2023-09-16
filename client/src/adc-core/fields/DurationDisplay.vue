<template>
  <div class="_metaField">
    <DLabel :str="title" />
    <div>
      <template v-if="duration">
        {{ formatDurationToHoursMinutesSeconds(duration) }}
      </template>
      <template v-else>•:••</template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    duration: String,
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
