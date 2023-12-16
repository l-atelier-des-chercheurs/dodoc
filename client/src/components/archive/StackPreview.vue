<template>
  <div class="u-card2 _stackPreview">
    <div class="_preview" @click="openStack">
      <MediaContent
        v-if="stack.$preview"
        :file="stack.$preview"
        class="_mediaPreview"
      />
      <small v-else v-text="'–'" />
    </div>
    <div class="">
      {{ stack.title }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    stack: Object,
  },
  components: {},
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    openStack() {
      const stack_slug = this.getFilename(this.stack.$path);
      this.$emit("openStack", stack_slug);
    },
  },
};
</script>
<style lang="scss" scoped>
._preview {
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;
  background: var(--c-gris_clair);

  > * {
    object-fit: contain;
    object-position: bottom;
    height: 100%;
    width: 100%;
  }
}
</style>
