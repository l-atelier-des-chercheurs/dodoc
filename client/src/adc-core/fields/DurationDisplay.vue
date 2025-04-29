<template>
  <div class="u-metaField" @click="show_detail = !show_detail">
    <DLabel :str="title" />
    <div>
      <template v-if="duration">
        <template v-if="!show_detail">{{
          formatDurationToHuman(duration)
        }}</template>
        <template v-else>{{
          formatDurationToHoursMinutesSecondsDeciseconds(duration)
        }}</template>
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
    show_detail_initially: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      show_detail: this.show_detail_initially,
    };
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
