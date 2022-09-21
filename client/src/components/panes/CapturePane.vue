<template>
  <div class="_capturePane">
    <CaptureView
      :slugFolderName="project.slug"
      :type="'projects'"
      :read_only="false"
    />
  </div>
</template>
<script>
import CaptureView from "./capture/CaptureView.vue";

export default {
  props: {
    project: Object,
  },
  components: {
    CaptureView,
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
  background: var(--color-Capture);
  height: 100%;
  overflow: auto;
}
</style>
