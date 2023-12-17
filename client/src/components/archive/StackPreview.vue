<template>
  <div class="_stackPreview">
    <div
      class="_stackPreview--content"
      :class="{
        'is--selected': is_selected,
      }"
    >
      <div class="_preview" @click="openStack">
        <MediaContent
          v-if="stack.$preview"
          :file="stack.$preview"
          class="_mediaPreview"
        />
        <b-icon v-else icon="eye-slash" />
      </div>
      <div class="_title">
        {{ stack.title }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    stack: Object,
    is_selected: Boolean,
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
._stackPreview {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  align-items: stretch;

  font-size: var(--sl-font-size-x-small);

  padding: 0px;
}

._stackPreview--content {
  position: relative;
  // box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  background: #fff;
  border: 2px solid var(--c-bodybg);

  transform-origin: center calc(100% - 2em);
  transition: all 0.45s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--selected {
    border-color: var(--c-rouge);
  }

  &:hover,
  &:focus-visible {
    z-index: 2;
    border-color: var(--c-gris_fonce);
    // transform: scale(1.05);
  }
}

._preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;

  cursor: pointer;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;

  ._mediaPreview {
    position: relative;
    height: 100%;
    width: 100%;

    ::v-deep {
      ._mediaContent--image {
        height: 100%;
        width: 100%;
        object-fit: contain;
        object-position: bottom;
      }
    }
  }
}

._title {
  height: 2em;
  padding: calc(var(--spacing) / 6) calc(var(--spacing) / 2);

  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}
</style>
