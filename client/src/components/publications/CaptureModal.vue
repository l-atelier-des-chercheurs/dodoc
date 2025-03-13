<template>
  <BaseModal2 :title="$t('capture')" :size="'full'" @close="$emit('close')">
    <CaptureView
      :path="path"
      :selected_mode="selected_mode"
      :stopmotion_slug="stopmotion_slug"
      :available_modes="available_modes"
      @changeMode="selected_mode = $event"
      @openStopmotion="stopmotion_slug = $event"
      @insertMedia="insertMedia"
    />
  </BaseModal2>
</template>
<script>
export default {
  props: {
    path: String,
    available_modes: Array,
  },
  components: {
    CaptureView: () => import("@/adc-core/capture/CaptureView.vue"),
  },
  data() {
    return {
      selected_mode: "photo",
      stopmotion_slug: undefined,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async insertMedia(meta_filename) {
      const path_to_source_media_meta = this.path + "/" + meta_filename;
      const path_to_source_media_metas = [path_to_source_media_meta];
      this.$emit("createMosaic", {
        path_to_source_media_metas,
      });
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped></style>
