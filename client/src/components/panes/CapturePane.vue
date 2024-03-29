<template>
  <div class="_capturePane">
    <CaptureView
      :path="project.$path"
      :selected_mode="selected_mode"
      :stopmotion_slug="stopmotion_slug"
      @changeMode="$emit('update:selected_mode', $event)"
      @openStopmotion="$emit('update:stopmotion_slug', $event)"
    />
  </div>
</template>
<script>
export default {
  props: {
    project: Object,
    selected_mode: String,
    stopmotion_slug: String,
  },
  components: {
    CaptureView: () => import("@/adc-core/capture/CaptureView.vue"),
  },
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
._capturePane {
  // background: var(--color-capture);
  height: 100%;
  overflow: auto;
}
</style>
