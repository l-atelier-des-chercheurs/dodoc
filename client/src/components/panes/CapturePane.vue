<template>
  <div class="_capturePane">
    <CaptureView
      :slugFolderName="project.$path"
      :type="'projects'"
      :path="project.$path"
      :read_only="false"
      :selected_mode="selected_mode"
      @changeMode="$emit('update:selected_mode', $event)"
    />
  </div>
</template>
<script>
export default {
  props: {
    project: Object,
    selected_mode: String,
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
