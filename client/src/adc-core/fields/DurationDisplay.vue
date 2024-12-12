<template>
  <div class="u-metaField">
    <DLabel :str="title" />
    <div>
      <template v-if="duration">
        {{ formatDurationToHoursMinutesSecondsDeciseconds(duration) }}
      </template>
      <template v-else>•:••</template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    duration: Number,
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
<style lang="scss"></style>
