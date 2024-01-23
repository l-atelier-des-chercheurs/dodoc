<template>
  <div class="_stackPreview">
    <button
      type="button"
      class="_stackPreview--content"
      :class="{
        'is--selected': is_selected,
      }"
      @click="openStack"
      @mouseenter="startSlide"
      @mousemove="updateMousePos"
      @mouseleave="endSlide"
    >
      <div class="_preview">
        <div
          key="preview"
          class="_mainPreview"
          :class="{
            'is--showingSlides': slide_file_to_show,
          }"
        >
          <MediaContent
            v-if="stack.$preview"
            :file="stack.$preview"
            class="_mediaPreview"
          />
          <b-icon v-else icon="eye-slash" />
        </div>

        <!-- <transition name="pagechange" mode="in-out"> -->
        <div
          class="_slide"
          v-if="slide_file_to_show"
          :key="slide_file_to_show.$path"
        >
          <MediaContent :file="slide_file_to_show" class="_mediaPreview" />
        </div>
        <!-- </transition> -->

        <transition name="pagechange" mode="out-in">
          <div
            class="_count"
            v-if="index_of_slide_file_to_show === undefined"
            key="preview"
          >
            {{ number_of_medias_in_stack }}
          </div>
          <div class="_count" v-else key="slide">
            {{ index_of_slide_file_to_show + 1 }} /
            {{ number_of_medias_in_stack }}
          </div>
        </transition>
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
    return {
      start_slide: false,
      stack_files: undefined,
      index_of_slide_file_to_show: undefined,
    };
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
    slide_file_to_show() {
      return this.stack_files &&
        this.index_of_slide_file_to_show !== undefined &&
        this.index_of_slide_file_to_show > 0
        ? this.stack_files[this.index_of_slide_file_to_show]
        : false;
    },
  },
  methods: {
    openStack() {
      const stack_slug = this.getFilename(this.stack.$path);
      this.$emit("openStack", stack_slug);
    },
    async startSlide(event) {
      this.start_slide = true;
      setTimeout(async () => {
        if (this.start_slide) {
          const files = await this.loadFiles();
          this.stack_files = files;
          this.updateMousePos(event);
        }
      }, 500);
    },
    updateMousePos(event) {
      if (!this.stack_files) return;

      const { pageX } = event;
      const { x, width } = event.target.getBoundingClientRect();
      const move_percent = (pageX - x) / width;
      this.index_of_slide_file_to_show = Math.floor(
        move_percent * this.number_of_medias_in_stack
      );
    },
    endSlide() {
      this.start_slide = false;
      this.stack_files = undefined;
      this.index_of_slide_file_to_show = undefined;
    },
    async loadFiles() {
      const stack = await this.$api.getFolder({
        path: this.stack.$path,
      });
      return this.getStackFilesInOrder({
        stack,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._stackPreview {
  position: relative;
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
  min-height: 3rem;
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
._slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  display: flex;
  align-content: center;
  align-items: center;
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

._mainPreview {
  width: 100%;
  opacity: 1;
  transition: all 0.25s ease-out;
  &.is--showingSlides {
    opacity: 0;
  }
}
</style>
