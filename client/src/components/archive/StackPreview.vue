<template>
  <div class="_stackPreview">
    <button
      type="button"
      class="_stackPreview--content"
      :class="{
        'is--selected': is_selected,
      }"
      @click="openStack"
      @mouseover="startSlide"
      @mouseend="endSlide"
    >
      <div class="_preview">
        <MediaContent
          v-if="stack.$preview"
          :file="stack.$preview"
          class="_mediaPreview"
        />
        <b-icon v-else icon="eye-slash" />
        <div class="_count">
          {{ number_of_medias_in_stack }}
        </div>
      </div>
      <div class="_title">
        {{ stack.title }}
      </div>
    </button>
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
  computed: {
    number_of_medias_in_stack() {
      return this.stack.stack_files_metas?.length || 0;
    },
  },
  methods: {
    openStack() {
      const stack_slug = this.getFilename(this.stack.$path);
      this.$emit("openStack", stack_slug);
    },
    startSlide() {
      this.start_slide = true;
      this.loadFiles();
    },
    endSlide() {
      this.start_slide = false;
    },
    loadFiles() {},
  },
};
</script>
<style lang="scss" scoped>
._stackPreview {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  align-items: stretch;
  padding: 0px;
  min-height: 8rem;
}

._stackPreview--content {
  appearance: none;
  padding: 0;
  text-align: left;
  font-size: var(--sl-font-size-x-small);

  position: relative;
  // box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  background: transparent;
  border: 2px solid var(--c-bodybg);
  cursor: pointer;

  border-radius: 2px;
  overflow: hidden;
  padding: 2px;

  transform-origin: center calc(100% - 2em);
  transition: all 0.45s cubic-bezier(0.19, 1, 0.22, 1);

  > * {
    pointer-events: none;
  }

  &.is--selected {
    border-color: var(--c-rouge);
  }

  &:hover,
  &:focus-visible {
    z-index: 2;
    // border-color: var(--c-gris_fonce);
    background: var(--c-gris);
    // transform: scale(1.05);
  }
}

._preview {
  position: relative;
  width: 100%;
  min-height: 2rem;
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
        max-height: 10rem;
        object-fit: contain;
        object-position: left bottom;
      }
    }
  }
}

._title {
  height: 1.5em;
  padding: 0 calc(var(--spacing) / 4);

  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}

._count {
  position: absolute;
  bottom: 0;
  left: 0;
  margin: calc(var(--spacing) / 4);
  font-weight: 600;
  text-shadow: white 0px 0px 3px;
  color: black;
  line-height: 1;
}
</style>
